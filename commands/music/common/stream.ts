
import { ChatInputCommandInteraction } from "discord.js";
import { Common, DiscordClient} from "../../../type/type.error";
import { ClientResource } from "./client";
import { CommunityServer } from "../../../type/type.common";
import { AudioPlayer, NoSubscriberBehavior, VoiceConnection, createAudioPlayer, joinVoiceChannel } from "@discordjs/voice";

export class Stream extends ClientResource {
	constructor(input: ChatInputCommandInteraction) {
		super(input);
	}


	get_player():AudioPlayer| undefined {
		if(!this.communityServer) return

			try {
				return createAudioPlayer({
						behaviors: {
							noSubscriber: NoSubscriberBehavior.Pause,
						},
						
					});
				} catch (e) {
					this.log_player_error(this.communityServer,e);
					this.sendEmbed(this.communityServer,Common.try_catch) 
				}
	}

	get_connection(): VoiceConnection | undefined {
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

			return joinVoiceChannel({
				channelId: this.member.voice.channel.id,
				guildId: this.member.voice.channel.guild.id,
				adapterCreator: this.member.voice.channel.guild.voiceAdapterCreator,
				selfMute: false,
				selfDeaf: true,
			})

		} catch (e) {
			this.log_connection_error(this.communityServer, "try_catch error", e);
			return this.sendEmbed(this.communityServer, Common.try_catch);
		}
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

