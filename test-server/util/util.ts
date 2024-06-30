import { ProcessMessage, ProcessRoleCode } from "../type/type.process";
import net from "net";

export function TodayDate() {
	const date = new Date();
	return date.toJSON().replace(/T|Z/g, " ");
}


export function heartBeat(client:net.Socket,role:ProcessRoleCode) {
	setInterval(() => {
		client.write(
			JSON.stringify(
				{
					type: "heartbeat",
					time: TodayDate(),
					role: role
				} as ProcessMessage))
	}, 1500)
}

export function debugLog(message: string) {
	console.log("--------------------------\n"+message+"\n--------------------------\n")
}

