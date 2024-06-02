import net from "net";
import { ProcessData, ProcessMessage, ProcessRole } from "../type/type.process";
import { registerRequest } from "./sub-musicCommand/register";
import { debugLog } from "../util/util";
import port from "../config/port.json";

export const processData:ProcessData = {
	role: ProcessRole.musicCommand,
	active: false,
	notRegisterProcess: false,
	legacyUser: new Set(),
	port: 0,
}
/**
 * 
 * connection management process.
 * 
 */
const client = net.createConnection({ port: port.default }, () => {
	
	const result = registerRequest(client,processData);

	if(result == "success") {
		debugLog("process active. [ignore management process]")
		processData.active = true;
	}
});

client.on('data', (data) => receiveSoketEvent(data));
client.on('end', () => {
	console.log('disconnected from server');
});

function receiveSoketEvent(data:Buffer) {
	const message = JSON.parse(data.toString()) as ProcessMessage;
	
	if(message.type == "register-response") {
		if(message.state == "success") {
			debugLog("process active. [received ok sign from management process1]")
			processData.active = true;
		} else {
			setTimeout(() => {
				debugLog("retry register request.")
				return registerRequest(client,processData);
			}, 1000*10);
		}
	}
}

/**
 * 
 * single
 * 
 */