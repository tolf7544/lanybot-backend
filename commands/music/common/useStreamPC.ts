import { musicIPCdataFormat } from "../../../type/type.IPCdata";
import { DiscordClient, Streaming } from "../../../type/type.error";
import { ActionStatus, FailedReason, MusicWorkerAction } from '../../../type/type.stream';
import { MusicWorkerType, ProcessMessage } from "../../../type/type.versionManager";
import { useMusic } from "./music";
import { clearSystemMsg } from "./embed";
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
				processId: process.pid
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
				const activeMetadata = musicStream.queue.active();
				clearSystemMsg("error",musicStream.lang,musicStream.communityServer?.guild.id,activeMetadata)
				musicStream.sendEmbed(musicStream.communityServer,DiscordClient.failed_join_voice_channel);
			} else if(message.process.music.reason == FailedReason.FailedGetReadableStream) {
				const activeMetadata = musicStream.queue.active();
				clearSystemMsg("error",musicStream.lang,musicStream.communityServer?.guild.id,activeMetadata)
				musicStream.sendEmbed(musicStream.communityServer,Streaming.failed_get_readable_stream_data);
			
			} else if(message.process.music.reason == FailedReason.VideoUnavailable) {
				const activeMetadata = musicStream.queue.active();
				clearSystemMsg("error1",musicStream.lang,musicStream.communityServer?.guild.id,activeMetadata)
				musicStream.sendEmbed(musicStream.communityServer,Streaming.video_unavailable);
			
			} else if(message.process.music.reason == FailedReason.FailedPlayStream) {
				const activeMetadata = musicStream.queue.active();
				clearSystemMsg("error",musicStream.lang,musicStream.communityServer?.guild.id,activeMetadata)
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
				return;
			} else if(message.process.music.status == ActionStatus.finished) {
				const activeMetadata = musicStream.queue.active();
				if(musicStream.queue.loop != "false") {
					if(musicStream.queue.action.isSkip) {
						/** pass */
					} else {
						clearSystemMsg("loop",musicStream.lang,musicStream.communityServer?.guild.id,activeMetadata)
					}
					
				} else {
					if(musicStream.queue.action.isSkip) {
						/** pass */
					} else {
						clearSystemMsg("common",musicStream.lang,musicStream.communityServer?.guild.id,activeMetadata)
					}
				}
				let metadata;
				if(musicStream.queue.action.isClear) {
					musicStream.queue.clear()
					musicStream.queue.activeId = 0
					musicStream.queue.action.isClear = false;
					return; // 리턴 안할시 clearStream message를 한번더 전송하게 됨
				} else if(musicStream.queue.action.isSkip) {
					/** pass */
					metadata = musicStream.queue.active();
					musicStream.queue.action.isSkip = false;
				} else {
					metadata = musicStream.queue.next();
				}
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
			if (message.process.music.reason == FailedReason.EarlySkipping) {
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