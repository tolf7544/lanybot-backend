
import { ClientResource } from "./client";
import { Database } from "./database";
import { Queue } from "./queue";
import { CacheType, ChannelType, ChatInputCommandInteraction, Message } from "discord.js";
import { client } from "../../..";
import { useGuild } from "../../../lib/useGuild";
import { AudioPlayer, AudioPlayerStatus, VoiceConnection } from "@discordjs/voice";
import { error } from "winston";
import { DiscordClient, Streaming } from "../../../type/type.error";
import { Lang } from "../../../lib/word";
import { CommunityServer } from "../../../type/type.common";
import { action, command, status } from "../../../type/type.log";

export function useMusic(guildId:string,i:ChatInputCommandInteraction) {
	if(client.music.has(guildId)) {
		return client.music.get(guildId)
	} else {
		const server = useGuild(i)
		if(!server) return; 
		client.music.set(server.guild.id,new Music(i))
		return client.music.get(guildId)
	}
}

export class Music extends ClientResource {
	queue: Queue
	database: Database

	player: AudioPlayer
	connection: VoiceConnection

	constructor(input:ChatInputCommandInteraction) {
		super(input);
		this.queue = new Queue(input);
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

	
	async play(input_query: string, isNext: boolean) {
		
		this.checkUserPlayState().then(async () => {

			this.queue.add(input_query, isNext).then(() => {
				if (!this.connection || !this.player) {
					//await this.play()
					
					console.log(this.queue.keys())
					} else {
						// if (isNextAdd == true) this.addEmbed(this.queue[this.activeStreamIndex + 1], this.queue.length) // 현재 재생하는 노래의 다음 어레이 위치에 있는 music 클래스 입력
						// if (isNextAdd == false) this.addEmbed(this.queue[this.queue.length - 1], this.queue.length) // 현재 어레이 마지막에 위치한 music 클래스 입력
					}
			}).catch((res) => {
				if(typeof res == "string") {this.sendEmbed(this.communityServer,res)}
			})



		})
		
	}

	skip(skipNumber:number | null):void {
		console.log(this.queue.keys())
		//this.checkUserControlQueueState().then(() => {
			if (!skipNumber) {
				//this.queue.activeId
				this.queue.remove();
				
				console.log(this.queue.keys())
			} else {
				//skipNumber
				this.queue.remove(skipNumber);
			}
		//})
	}

	get checkUserJoinVoiceChannel() {
		if(this.communityServer) {
			return this.communityServer.member.voice.channel === null ? false : true
		} else {
			false
		}
	}


	private checkUserViewQueueState(): Promise<void> {
		return new Promise((resolve,reject) => {
			if (this.queue.size == 0){
				this.sendEmbed(this.communityServer,Streaming.empty_queue)
				reject();
				}
			if(!this.connection|| !this.player) {
				return this.sendEmbed(this.communityServer,Streaming.empty_voice_info)
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
				if (!this.connection|| !this.player)  {
					return this.sendEmbed(this.communityServer,Streaming.controling_on_empty_qeue)
				}
				if (this.queue.size == 0) {
					return this.sendEmbed(this.communityServer,Streaming.empty_queue)
				}
				if (this.player.state.status == AudioPlayerStatus.Buffering || this.player.state.status == AudioPlayerStatus.Playing) {
					return this.sendEmbed(this.communityServer,Streaming.fast_command_use)
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