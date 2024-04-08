import { musicIPCdataFormat } from "../../../type/type.IPCdata";
import { DiscordClient, Streaming } from "../../../type/type.error";
import { ActionStatus, FailedReason, MusicWorkerAction } from '../../../type/type.stream';
import { MusicWorkerType, ProcessMessage } from "../../../type/type.versionManager";
import { useMusic } from "./music";
import { clearEmbed, clearSystemMsg, preStreamEmbed, showStream, skipEmbed } from "./embed";
import { CommunityServer } from "../../../type/type.common";
export function sendStreamPCMessage(targetPC: MusicWorkerType.stream, _action: keyof typeof MusicWorkerAction, data: musicIPCdataFormat) {

	if (process.send) {

		const musicStream = useMusic(data.guildId)
		if (musicStream) {
			musicStream.IsAction = true;
			process.send(JSON.stringify({
				process: {
					type: "music",
					versionType: targetPC,
					music: {
						action: _action
					}
				},
				data: JSON.stringify(data),
				processId: process.pid,
				targetPid: musicStream.streamingPid
			} as ProcessMessage<"music">))
		}
	}
}
export function receiveIPexecuteStream(message: ProcessMessage<"music">) {
	const guild = JSON.parse(message.data as string)
	const musicStream = useMusic(guild.guildId)
	if (musicStream) {
		musicStream.IsAction = false;
		if (message.process.music.status == ActionStatus.failed) {
			
			if (message.process.music.reason == FailedReason.MusicIsPlaying) {
				/**
				 * 
				 * return null
				 * 
				 */
			} else if(message.process.music.reason == FailedReason.FailedConnectChannel) {
				/**
				 * 
				 * return null
				 * 
				 */
				clearSystemMsg("error",musicStream.lang,musicStream.communityServer?.guild.id)
				musicStream.sendEmbed(musicStream.communityServer,DiscordClient.failed_join_voice_channel);
			} else if(message.process.music.reason == FailedReason.FailedGetReadableStream) {
				clearSystemMsg("error",musicStream.lang,musicStream.communityServer?.guild.id)
				musicStream.sendEmbed(musicStream.communityServer,Streaming.failed_get_readable_stream_data);
			
			} else if(message.process.music.reason == FailedReason.VideoUnavailable) {
				clearSystemMsg("error1",musicStream.lang,musicStream.communityServer?.guild.id)
				musicStream.sendEmbed(musicStream.communityServer,Streaming.video_unavailable);
			
			} else if(message.process.music.reason == FailedReason.FailedPlayStream) {
				clearSystemMsg("error",musicStream.lang,musicStream.communityServer?.guild.id)
				musicStream.sendEmbed(musicStream.communityServer,Streaming.failed_get_readable_stream_data);
			}

			const metadata = musicStream.queue.next();
			musicStream.playStream(metadata);
		} else {
			if (message.process.music.status == ActionStatus.success) {
				/**
				 * 
				 * return null
				 * 
				 */
				musicStream.streamingPid = message.processId
				
				return;
			} else if(message.process.music.status == ActionStatus.finished) {
				if(musicStream.queue.loop != "false") {
					if(musicStream.queue.action.isSkip) {
						clearSystemMsg("common",musicStream.lang,musicStream.communityServer?.guild.id)
					} else {
						clearSystemMsg("loop",musicStream.lang,musicStream.communityServer?.guild.id)
					}
					
				} else {
					console.log(1)
					clearSystemMsg("common",musicStream.lang,musicStream.communityServer?.guild.id)
				}
				console.log(2)
				let metadata;
				if(musicStream.queue.action.isClear) {
					musicStream.queue.clear()
					musicStream.queue.activeId = 0
					musicStream.queue.action.isClear = false;
					if(musicStream.communityServer) {
						clearEmbed(musicStream.communityServer)
					}

					return; // 리턴 안할시 clearStream message를 한번더 전송하게 됨
				} else if(musicStream.queue.action.isSkip) {
					/** pass */
					musicStream.queue.action.isSkip = false;
					const activePos = musicStream.queue.activePosition()

					metadata= musicStream.queue.remove();
					const nextKey = Array.from(musicStream.queue.keys())[activePos]
					musicStream.queue.activeId = nextKey;
					if(typeof metadata != "string" && metadata) {
						skipEmbed(metadata,musicStream.communityServer as CommunityServer)
					}

					metadata = musicStream.queue.active();
				} else if (musicStream.queue.action.isPreviousStream) {
					const activePos = musicStream.queue.activePosition()
					const previousKey = Array.from(musicStream.queue.keys())[activePos - 1]
					musicStream.queue.activeId = previousKey;
					metadata = musicStream.queue.active()
					musicStream.queue.action.isPreviousStream = false
					if(typeof metadata != "string" && metadata) {
						preStreamEmbed(musicStream.communityServer as CommunityServer,metadata)
					}
				} else {
					metadata = musicStream.queue.next();
				}
				console.log(3)
				console.log(metadata)
				musicStream.playStream(metadata);
			}
			
		}
	}
}
export function receiveIPCskipStream(message: ProcessMessage<"music">) {
	const guild = JSON.parse(message.data as string)

	const musicStream = useMusic(guild.guildId)
	if (musicStream) {
		musicStream.IsAction = false;
		if (message.process.music.status == ActionStatus.failed) {
			if (message.process.music.reason == FailedReason.EarlyAction) {
				return musicStream.sendEmbed(musicStream.communityServer,Streaming.fast_skip_request);
				/**
				 * 
				 * embed 천천히 스킵해주세요!
				 * 
				 */
			}
		} else {
			if (message.process.music.status == ActionStatus.success) {

				/**
				 * 
				 * 성공적으로 스킵되었습니다.
				 * 
				 */
			}
		}
	}
}

export function receiveIPCpreStream(message: ProcessMessage<"music">) {
	const guild = JSON.parse(message.data as string)

	const musicStream = useMusic(guild.guildId)
	if (musicStream) {
		musicStream.IsAction = false;
		if (message.process.music.status == ActionStatus.failed) {
			if (message.process.music.reason == FailedReason.EarlyAction) {
				return musicStream.sendEmbed(musicStream.communityServer,Streaming.fast_command_use);
				/**
				 * 
				 * embed 천천히 사용해주세요!
				 * 
				 */
			}
		} else {
			if(message.process.music.reason == FailedReason.MusicIsIdle) {
				return musicStream.sendEmbed(musicStream.communityServer,Streaming.stream_idle);
			} else if (message.process.music.status == ActionStatus.success) {

				/**
				 * 
				 * 성공적으로 스킵되었습니다.
				 * 
				 */
			}
		}
	}
}

export function receiveIPCnextStream(message: ProcessMessage<"music">) {
	const guild = JSON.parse(message.data as string)

	const musicStream = useMusic(guild.guildId)
	if (musicStream) {
		musicStream.IsAction = false;
		if (message.process.music.status == ActionStatus.failed) {
			if (message.process.music.reason == FailedReason.EarlyAction) {
				return musicStream.sendEmbed(musicStream.communityServer,Streaming.fast_command_use);
				/**
				 * 
				 * embed 천천히 사용해주세요!
				 * 
				 */
			}
		} else {
			if(message.process.music.reason == FailedReason.MusicIsIdle) {
				return musicStream.sendEmbed(musicStream.communityServer,Streaming.stream_idle);
			} else if (message.process.music.status == ActionStatus.success) {

				/**
				 * 
				 * 성공적으로 스킵되었습니다.
				 * 
				 */
			}
		}
	}
}

export function receivePlaybackDurationData(message: ProcessMessage<"music">) {
	const guild = JSON.parse(message.data as string)

	const musicStream = useMusic(guild.guildId)
	if (musicStream) {
		musicStream.IsAction = false;
		if (message.process.music.status == ActionStatus.failed) {
			if (message.process.music.reason == FailedReason.UndefinedPlayerState || message.process.music.reason == FailedReason.MusicIsIdle) {
				return musicStream.sendEmbed(musicStream.communityServer,Streaming.stream_idle);
				/**
				 * 
				 * embed 천천히 사용해주세요!
				 * 
				 */
			}
		} else {
			if (message.process.music.status == ActionStatus.success) {
				const _active = musicStream.queue.active()
				if(musicStream.communityServer && _active) {
					showStream(musicStream.communityServer,_active,guild.playbackDuration)
				}
				
				/**
				 * 
				 * 성공적으로 스킵되었습니다.
				 * 
				 */
			}
		}
	}
}