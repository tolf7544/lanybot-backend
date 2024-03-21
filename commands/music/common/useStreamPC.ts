import { debugging } from "../../..";
import { MusicWorkerAction, MusicWorkerType, ProcessMessage } from "../../../type/type.versionManager";
export function sendStreamPCMessage(targetPC: MusicWorkerType.stream, message: keyof typeof MusicWorkerAction,data: string) {

	if(process.send) {
		process.send(JSON.stringify({
			type: "worker",
			versionType: targetPC,
			message: message,
			data: data,
			processId: process.pid
		} as ProcessMessage<"worker">))
	}

	process.on("message", ((message: string) => {
		//const data = JSON.parse(message) as ProcessMessage<"cluster">;
		debugging(message);
	}))
}