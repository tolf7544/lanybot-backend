import { MusicWorkerAction, ActionStatus, FailedReason } from "../../type/type.stream";
import { MusicWorkerType, ProcessMessage } from "../../type/type.versionManager";

export function sendPCMessage(targetPC: MusicWorkerType.music,_action: keyof typeof MusicWorkerAction,_status:keyof typeof ActionStatus,pid:number,_reason?:keyof typeof FailedReason, data?: {guildId:string, playbackDuration?: number}) {

	if(process.send) {
		process.send(JSON.stringify({
			process: {
				type: "music",
				versionType: targetPC,
				music: {
					action: _action,
					status: _status,
					reason: _reason,
				}
			},
			data: JSON.stringify(data),
			processId: process.pid,
			targetPid: pid
		} as ProcessMessage<"music">))
	}
}