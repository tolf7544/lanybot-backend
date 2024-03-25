import { musicIPCdataFormat } from "../../../type/type.IPCdata";
import { Streaming } from "../../../type/type.error";
import { ActionStatus, FailedReason, MusicWorkerAction } from '../../../type/type.stream';
import { MusicWorkerType, ProcessMessage } from "../../../type/type.versionManager";
import { useMusic } from "./music";
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
				return 
			} else if(message.process.music.reason == FailedReason.FailedGetReadableStream) {
				return musicStream.sendEmbed(musicStream.communityServer,Streaming.failed_get_readable_stream_data);
			}
		} else {
			if (message.process.music.status == ActionStatus.success) {
				/**
				 * 
				 * return null
				 * 
				 */
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
				return 
				/**
				 * 
				 * 성공적으로 스킵되었습니다.
				 * 
				 */
			}
		}
	}
}