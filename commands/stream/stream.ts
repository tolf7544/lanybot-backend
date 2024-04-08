
import { Common, DiscordClient, Streaming} from "../../type/type.error";
import { ClientResource } from "../music/common/client";
import { CommunityServer } from "../../type/type.common";
import { AudioPlayer, NoSubscriberBehavior, StreamType, VoiceConnection, createAudioPlayer, createAudioResource, joinVoiceChannel } from "@discordjs/voice";
import { PreviewInteraction } from "../../type/type.index";
import ytdl from "@distube/ytdl-core";
import fs from 'fs';
import { sendPCMessage } from "./usePC";
import { MusicWorkerType } from "../../type/type.versionManager";
import { connectionEvent, playerEvent } from "./event";

export class Stream extends ClientResource {
	player: AudioPlayer;
	connection: VoiceConnection
	youtubeId:string;
	musicPid: number
	constructor(input: PreviewInteraction,id:string, pid: number) {
		super(input);
		this.musicPid = pid
		this.youtubeId = id;
	}

	streaming() {
		const guildId = this.guild?.id;
		this.resoucre().then((readableStream) => {
		if(readableStream == Streaming.failed_get_readable_stream_data) {
			return sendPCMessage(MusicWorkerType.music,"executeStream", "failed", this.musicPid, "FailedGetReadableStream", {guildId:guildId? guildId:"undefined"})
		} else {
			try {
				this.connection.subscribe(this.player);
				this.player.play(readableStream);
			} catch (error) {
				console.log(error)
				sendPCMessage(MusicWorkerType.music,"executeStream", "failed" ,this.musicPid, "FailedConnectChannel", {guildId:guildId? guildId:"undefined"})
			}
			
			return sendPCMessage(MusicWorkerType.music,"executeStream", "success", this.musicPid, undefined,{guildId:guildId? guildId:"undefined"})
		}
	})
	}

	set_player():AudioPlayer| undefined {
		if(!this.communityServer) return

			try {
				this.player = createAudioPlayer({
						behaviors: {
							noSubscriber: NoSubscriberBehavior.Pause,
						},
						
					});
					playerEvent(this.player,this.communityServer,this.musicPid);
				} catch (e) {
					this.log_player_error(this.communityServer,e);
					this.sendEmbed(this.communityServer,Common.try_catch) 
				}
	}

	set_connection(): VoiceConnection | undefined {
		if (!this.member) return;
		if (!this.communityServer) return;
		try {
			if (!this.member.voice.channel) {
				this.log_connection_error(
					this.communityServer,
					"input.member.voice.channel is null",
					"client_error (could not specific voiceChannel)"
				);
				return this.sendEmbed(this.communityServer, DiscordClient.failed_get_voice_channel);
			}

			if (!this.member.voice.channel.joinable) {
				this.log_connection_error(
					this.communityServer,
					"input.member.voice.channel cant not joinable",
					"missing_permission"
				);
				return this.sendEmbed(this.communityServer, DiscordClient.failed_join_voice_channel);

			}

			this.connection = joinVoiceChannel({
				channelId: this.member.voice.channel.id,
				guildId: this.member.voice.channel.guild.id,
				adapterCreator: this.member.voice.channel.guild.voiceAdapterCreator,
				selfMute: false,
				selfDeaf: true,
			})
			connectionEvent(this.connection,this.player,this.communityServer,this.musicPid);
		} catch (e) {
			this.log_connection_error(this.communityServer, "try_catch error", e);
			return this.sendEmbed(this.communityServer, Common.try_catch);
		}
	}

	async resoucre() {
		const url: string = 'https://youtu.be/' + this.youtubeId;
	
		try {
			const agent = await ytdl.createAgent(JSON.parse(fs.readFileSync(__dirname +"\\cookie.json", {encoding: 'utf-8'})));
	
			
			const _stream = await ytdl(url, {
				agent: agent,
				filter: format =>
				format.audioQuality == "AUDIO_QUALITY_MEDIUM" &&
				format.hasVideo == false &&
				format.hasAudio == true &&	
				format.container == "mp4",
				// quality: "highestaudio",
				highWaterMark: 1 << 25,
			})
			const _resource = createAudioResource(_stream,
				{
					inputType: StreamType.Arbitrary,
				}
				)
			return _resource;
		} catch (error) {
			this.missingIdLogger(
				`no resource or library error`,
				error,
			);
			return Streaming.failed_get_readable_stream_data
		}	
	}

	missingIdLogger(_message:string,_error: unknown) {
		this.logger.writeLog({
			guildData: {
				guild: { id: this.communityServer?.guild.id as string },
				user: { id: this.communityServer?.member.id as string}
			},
			location: {
				dir: __dirname,
				file: __filename,
				func: "resource",
			},
			isError: true,
			isCommand: true,
			service: {
				serviceType: 'music',
				Trigger: "CommandEvent",
				action: {
					name: "create_resource",
					status: "end",
				},
				active_loop: 'system_active'
			},
			cmd: {
				name: 'play',
				status: 'end'
			},
			message: _message,//`[${LoggerType.STREAM.ERROR}] id(const) is null`
			error: _error, //"missing url format"
		});
	}
	

	private log_player_error(guild:CommunityServer ,_error: unknown) {
		this.logger.writeLog({
			guildData: {
				guild: { id: guild.guild.id },
				user: { id: guild.member?.user.id }
			},
			location: {
				dir: __dirname,
				file: __filename,
				func: "setPlayer",
			},
			isError: true,
			isCommand: true,
			service: {
				serviceType: 'music',
				Trigger: "createAudioPlayer",
				action: {
					name: "create_audio_player",
					status: 'end'
				},
				active_loop: 'system_active'
			},
			cmd: {
				name: 'play',
				status: 'end',
			},
			error:_error,
			message: `discord createAudioPlayer func error occured`
		});
	}
	
	log_connection_error(guild: CommunityServer, _message: string, _error: unknown) {
		this.logger.writeLog({
			guildData: {
				guild: { id: guild.guild.id },
				user: { id: guild.member?.user.id }
			},
			location: {
				dir: __dirname,
				file: __filename,
				func: "setConnect",
			},
			isError: true,
			isCommand: true,
			service: {
				serviceType: 'music',
				Trigger: "CommandEvent",
				action: {
					name: "connect_voice_channel",
					status: "end"
				},
				active_loop: "system_active"
			},
			cmd: {
				name: 'play',
				status: 'end'
			},
			message: _message,
			error: _error
		})
	}
}

