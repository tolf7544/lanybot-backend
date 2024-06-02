import { ProcessMessage } from "../type/type.process"
import { heartbeatLogger } from "../util/log"

export function receiveHeartbeat(message: ProcessMessage) {
	console.log(`----------------------\nsend process: ${message.role}\ndate: ${message.time}\n----------------------`)
	heartbeatLogger(__filename, message.role)
}