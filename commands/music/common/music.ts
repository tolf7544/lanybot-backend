
import { ClientResource } from "./client";
import { Database } from "./database";
import { Queue } from "./queue";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CacheType, ChannelType, ChatInputCommandInteraction, EmbedBuilder, Interaction, Message, StringSelectMenuInteraction } from "discord.js";
import { client } from "../../..";
import { useGuild } from "../../../lib/useGuild";
import { AudioPlayer, VoiceConnection } from "@discordjs/voice";
import { error } from "winston";
import { DiscordClient, Streaming, StreamingQueue } from "../../../type/type.error";
import { Lang } from "../../../lib/word";
import { CommunityServer } from '../../../type/type.common';
import { action, command, status } from "../../../type/type.log";
import { Metadata } from "./queue/metadata";
import { sendStreamPCMessage } from "./useStreamPC";
import { MusicWorkerType } from "../../../type/type.versionManager";
import { Pageination } from "../../../lib/pageInation";
import { setTime } from "./yt_video/getMusicData";
import { interaction_reply } from "../../../lib/sendMessage";
import { addEmbed, clearSystemMsg, endEmbed, playEmbed, skipEmbed } from "./embed";

export function useMusic(guildId:string,i?:ChatInputCommandInteraction) {
	if(client.music.has(guildId)) {
		return client.music.get(guildId)
	} else {
		if(i) {
			const server = useGuild(i)
			if(!server) return; 
			client.music.set(server.guild.id,new Music(i))
			return client.music.get(guildId)
		} else {
			return null;
		}

	}
}

export class Music extends ClientResource {
	queue: Queue
	database: Database

	player: AudioPlayer
	connection: VoiceConnection
	IsAction: boolean;

	constructor(input:ChatInputCommandInteraction) {
		super(input);
		this.queue = new Queue(input);
		this.IsAction = false;
	}

	update_user(i:ChatInputCommandInteraction<CacheType> | Message<true>) {
		const server: CommunityServer | undefined = useGuild(i)

		this.communityServer = server
		this.guild = server?.guild
		this.channel = server?.channel
		this.member = server?.member
	
		if(server?.guild.id && server.interaction) {
			this.lang = new Lang(server.guild.id);
			this.queue.communityServer = server
		}
	}

	useServer(): Promise<CommunityServer> {
		return new Promise((resolve: ((success:CommunityServer) => void),reject:((error:boolean) => void)) => {
			if(!this.communityServer) {
				reject(false);
			} else if(!this.communityServer.interaction) {
				reject(false);
			} else {
				resolve(this.communityServer);
			}
		})

	}
	
	play(query: string, isNext: boolean) {
		this.checkUserPlayState().then(() => {
			this.useServer().then(async (server) => {
				this.queue.add(query, isNext, server, ((metadata: Metadata) => {
					if (this.queue.size > 1) {
						addEmbed(
							metadata as Metadata,
							this.communityServer as CommunityServer,
							this.queue.size
						)
					} else {
						this.playStream(metadata);
					}
				}))
			})
		})
	}

	playStream(metadata: Metadata | undefined) {
		this.useServer().then(async (server) => {
		this.checkQueueSize(async () => {
			metadata = metadata as Metadata;
			if (metadata?.MusicData) {
				metadata.setMusic(this.communityServer as CommunityServer).then(() => {
					playEmbed(
						metadata as Metadata,
						server,
						this.lang,
						this.queue.size
						)
				});
			} else {
				return this.sendEmbed(this.communityServer,StreamingQueue.unknown_queue)
			}

			sendStreamPCMessage(MusicWorkerType.stream, "executeStream", {
				youtubeId: metadata.id,
				guildId: this.guild?.id as string,
				memberId: this.member?.id as string,
				channelId: this.channel?.id as string
			});
		});
		return metadata;
		})
	}

	skip(skipNumber: number | null): void {
		this.checkUserControlQueueState().then(() => {
			let metadata: string | Metadata | undefined
			if (!skipNumber) {
				//this.queue.activeId
				metadata = this.queue.remove();

			} else {
				//skipNumber
				metadata = this.queue.remove(skipNumber);
			}
			
			if (typeof metadata == "string") {
				this.sendEmbed(this.communityServer, metadata)
			} else if (metadata && this.communityServer) {
				clearSystemMsg("common",this.lang,this.communityServer?.guild.id,metadata)
				skipEmbed(metadata, this.communityServer)
			}
		})
		this.queue.action.isSkip = true;
		sendStreamPCMessage(MusicWorkerType.stream, "skipStream", {
			youtubeId: "undefined",
			guildId: this.guild?.id as string,
			memberId: this.member?.id as string,
			channelId: this.channel?.id as string
		})
	}

	loop(loopState: Queue["loop"]) {
		this.queue.loop = loopState;

		/**
		 * 
		 * embed 작성
		 * 
		 */
	}

	showQueue() {
		this.checkUserViewQueueState().then(() => {
			const rowData = []

			for(const row of Array.from(this.queue.entries())) {
				rowData.push({
						name: (rowData.length+1)+"." + row[1].MusicData.title,
						value: `${setTime(row[1].MusicData.timeS,this.communityServer as CommunityServer)} [youtube link](https://www.youtube.com/watch?v=${row[1].id})`
					})
			}
			const page = new Pageination(rowData, 8);
			page.PageSetting();
			if(page.activePage.length < 1 || !this.queue.active()) {
				return this.sendEmbed(this.communityServer,StreamingQueue.unknown_queue)
				/**
				send embed 
				플레이 리스트 정보가 없습니다....
				대기열을 한번 초기화 후 다시 시도해주세요!
				*/
			}
			if(page.cPageInfo.isSinglePage == true) {
				interaction_reply(this.communityServer?.interaction,[],this.showQueueEmbed(page))
			} else {
				const message = interaction_reply(this.communityServer?.interaction,[this.controlComponents(false,true,false)],this.showQueueEmbed(page))
				if(message) {
					message.then((_message) => {
						if(!_message) return;
						const filter = (i: Interaction<CacheType>) => i.user.id == this.communityServer?.member.id;
						const collector = _message.createMessageComponentCollector({ filter, time: 1000 * 60 * 60 })
					
						collector.on('end', () => {
							interaction_reply(this.communityServer?.interaction,[],this.showQueueEmbed(page))
						})
					
						collector.on('collect', (i: StringSelectMenuInteraction<CacheType>) => {
							if(i.customId == "music_list_previous_page") {
								page.previousPage();
								
								const _embed =this.showQueueEmbed(page)
								if (page.cPageInfo.activePage == page.cPageInfo.pageCount) {
									interaction_reply(this.communityServer?.interaction,[this.controlComponents(false,true,true)],_embed)
								} else {
									interaction_reply(this.communityServer?.interaction, [this.controlComponents(true,true,true)],_embed)
								}
							}

							if(i.customId == "music_list_next_page") {
								page.nextPage();

								const _embed =this.showQueueEmbed(page)
								if (page.cPageInfo.activePage == page.cPageInfo.pageCount) {
									interaction_reply(this.communityServer?.interaction,[this.controlComponents(true,false,true)],_embed)
								} else {
									interaction_reply(this.communityServer?.interaction, [this.controlComponents(true,true,true)],_embed)
								}
							}

							if(i.customId == "music_list_cancel_page") {
								interaction_reply(this.communityServer?.interaction,[],this.showQueueEmbed(page))
							}
						})
					})
				}
			}
			
		})
	}

	pause() {
		this.checkUserControlQueueState().then(() => {
			if(this.queue.action.isPause == true) {
				/**
				 * 
				 * 이미 pause가 적용됨 안내 메시지 보내기
				 * 
				 */
			} else {
				sendStreamPCMessage(MusicWorkerType.stream, "pauseStream", {
					youtubeId: "undefined",
					guildId: this.guild?.id as string,
					memberId: this.member?.id as string,
					channelId: this.channel?.id as string
				})
			}
		})
	}

	resume() {
		this.checkUserControlQueueState().then(() => {
			if(this.queue.action.isPause == false) {
				/**
				 * 
				 * 이미 pause가 적용됨 안내 메시지 보내기
				 * 
				 */
			} else {
				sendStreamPCMessage(MusicWorkerType.stream, "resumeStream", {
					youtubeId: "undefined",
					guildId: this.guild?.id as string,
					memberId: this.member?.id as string,
					channelId: this.channel?.id as string
				})
			}
		})
	}

	clear() {
		this.checkUserControlQueueState().then(() => {
			this.queue.action.isClear = true;

			sendStreamPCMessage(MusicWorkerType.stream, "clearStream", {
				youtubeId: "undefined",
				guildId: this.guild?.id as string,
				memberId: this.member?.id as string,
				channelId: this.channel?.id as string
			})
		})
	}

	controlComponents(argu1:boolean,argu2: boolean, argu3: boolean) {
		const buttonBuilder = []
		
		if(argu1) {
			buttonBuilder.push(
				new ButtonBuilder()
				.setCustomId(`music_list_previous_page`)
				.setLabel(this.lang.showQueueButton_Title[0])
				.setEmoji('⬅️')
				.setStyle(ButtonStyle.Primary)
			)

		}
		if(argu2) {
			buttonBuilder.push(
				new ButtonBuilder()
				.setCustomId(`music_list_next_page`)
				.setLabel(this.lang.showQueueButton_Title[1])
				.setEmoji('➡️')
				.setStyle(ButtonStyle.Primary)
			)
		}
		if(argu3) {
			buttonBuilder.push(
				new ButtonBuilder()
				.setCustomId(`music_list_cancel_page`)
				.setLabel(this.lang.showQueueButton_Title[2])
				.setStyle(ButtonStyle.Danger)
			)
		}

		return new ActionRowBuilder<ButtonBuilder>()
				.addComponents(...buttonBuilder)
	} 		

	showQueueEmbed(page: Pageination) {
		const activeMusic = this.queue.active() as Metadata
		const nameData = activeMusic.MusicData.title.length > 80 ? activeMusic.MusicData.title.substr(0, 80) + "..." : activeMusic.MusicData.title
		const username = this.communityServer?.member.displayName
		
		return new EmbedBuilder()
			.setAuthor({ iconURL: `https://cdn.discordapp.com/emojis/1117124916123279460.webp?size=128&quality=lossless`, name: `[${page.cPageInfo.activePage} / ${page.cPageInfo.pageCount }] ${this.lang.showpQueue_Title}` })
			.setDescription(`\`${nameData}\``)
			.setColor(`Blue`)
			.setThumbnail(`${activeMusic.MusicData.thumbnail}`)
			.addFields(
				page.activePage
			)
			.setFooter({text:username ? username: '오류'}).toJSON();
	}

	get checkUserJoinVoiceChannel() {
		if(this.communityServer) {
			return this.communityServer.member.voice.channel === null ? false : true
		} else {
			false
		}
	}

	private checkQueueSize(run: CallableFunction) {
		if(this.queue.size == 0 || !this.queue.active()) {
			if(this.communityServer) {
				sendStreamPCMessage(MusicWorkerType.stream,"clearStream",{
					guildId: this.communityServer.guild.id,
					youtubeId: "undefined",
					memberId: "undefined",
					channelId: "undefined"
				})
				this.queue.clear();
				this.queue.activeId = 0
				endEmbed(this.communityServer)
			}
		} else {
			run();
		}
	}



	private checkUserViewQueueState(): Promise<void> {
		return new Promise((resolve) => {
			if (this.queue.size == 0){
				this.sendEmbed(this.communityServer,Streaming.empty_queue)
				return;
			}
			resolve()
		})
	}

	checkUserPlayState(): Promise<void> {
		return new Promise((resolve) => {
			if (!this.checkUserJoinVoiceChannel)  {
				return this.sendEmbed(this.communityServer,DiscordClient.not_connected_voice_channel)
			}

			this.checkClientUserPermission().then(() => {
				if(this.connection|| this.player) {
				resolve();
				} else {
					resolve();
				}
			})
		})
	}

	checkUserControlQueueState(): Promise<void> {
		return new Promise((resolve) => {
			if (!this.checkUserJoinVoiceChannel) {
				return this.sendEmbed(this.communityServer,DiscordClient.not_connected_voice_channel)
			}

			this.checkClientUserPermission().then(() => {
				if (this.queue.size == 0) {
					return this.sendEmbed(this.communityServer,Streaming.empty_queue)
				}
				resolve()
			})

		})
	}

	checkClientUserPermission(): Promise<void> {
		return new Promise((resolve) => {
			if(!this.communityServer) return;

			const clientUser = this.communityServer.guild.members.me;
			const member = this.communityServer.member;
			const channel = this.communityServer.channel;

			if (channel.type == ChannelType.GuildText) {
				if (clientUser) {
					if (!channel.permissionsFor(clientUser).has("SendMessages") || !channel.permissionsFor(clientUser).has("ViewChannel")) {
						if (member.dmChannel == null) {
							member.createDM().then((dm) => {
								dm.send(`${this.lang.errorMissingTextChannelPermission_Title}\n${this.lang.errorMissingTextChannelPermission_Description}`)
							})
						} else {
							member.dmChannel.send(`${this.lang.errorMissingTextChannelPermission_Title}\n${this.lang.errorMissingTextChannelPermission_Description}`)
						}
						return;
					}
					if (member.voice.channel) {
						if (!member.voice.channel.permissionsFor(clientUser).has('Connect') || !member.voice.channel.permissionsFor(clientUser).has('Speak')) {
							error(this.lang.errorMissingTextChannelPermission_Title, this.lang.errorMissingTextChannelPermission_Description, this.guild);
							return;
						}
					}
				} else {
					return;
				}
			} else {
				return;
			}
			resolve();
		})
	}

	private command_logger(_func: string, _action_name: action, _action_status: status, _cmd_name: command, _cmd_status: status, _isError: boolean, _error: unknown, _message: string) {
		if(!this.communityServer) return;
		
		this.logger.writeLog({
			isCommand: true,
			isError: _isError,
			error: _error,
			message: _message,
			guildData: {
				guild: { id: this.communityServer.guild.id },
				user: { id: this.communityServer.member.user.id }
			},
			location: {
				dir: __dirname,
				file: __filename,
				func: _func
			},
			service: {
				serviceType: "music",
				Trigger: 'CommandEvent',
				action: {
					name: _action_name,
					status: _action_status,
				},
				active_loop: "system_active"
			},
			cmd: {
				name: _cmd_name,
				status: _cmd_status,
			}
		})
	}

}