import { pm } from "..";
import { Process } from "../type/type.pm";
import { ProcessMessage, ProcessRegister, ProcessRoleName, processRole } from "../type/type.process";
import { processLogger } from "../util/log";
import { TodayDate, debugLog } from "../util/util";
import net from 'net';
import {code,number}  from "../config/version.json";
import { Status } from "../type/type.util";

export function receiveRegister(connection:net.Socket,message: ProcessRegister) {
	debugLog("process [role:"+message.role+"] ")

	debugLog("ready for process registering...")
	const result = register(message);
	if(result.status == "success") {
		debugLog("register process finished")
		connection.write(JSON.stringify({
			"pid": process.pid,
			"role": processRole.processManagement,
			"time": TodayDate(),
			"type": "register-response",
			"state": "success",
			"message": "register success. start exchanging legacy process client data."
		} as ProcessMessage));
	} else {
		connection.write(JSON.stringify({
			"pid": process.pid,
			"role": processRole.processManagement,
			"time": TodayDate(),
			"type": "register-response",
			"state": "success",
			"message": "register failed. logged in ./log/process"
		} as ProcessMessage));
	}
	
	connection.pipe(connection);
}

function register(message: ProcessRegister):{port?: number,status: Status} {
	const process = pm.findEntry(message.role, "value") as Process[]
	const versionCode = code[message.role] as ProcessRoleName
	console.debug(process)
	if(process) {
		if(process.length >= 2) {
			processLogger(__filename,{role: processRole.processManagement, message: "active process is more than 2. waiting for finish legacy process."})
			return {
				status: "cancel"
			};
		} else {
			const temp = [];
			for(let i = 0; i<process.length; i++) {
				process[i].status = "previous";
				temp.push(process[i].port)
			}
			pm.set(message.pid,{
				role: message.role,
				version: number[versionCode],
				port: message.port,
				status: "active"
			})

			processLogger(__filename,{role: processRole.processManagement, message: "update process version."+` legacy version: ${process[0].version}`})
			return {
				port: temp.pop(),
				status: "success"
			};
		}
	} else {
		
		pm.set(message.pid,{
			role: message.role,
			version: number[versionCode],
			port: message.port,
			status: "active"
		})
		
		processLogger(__filename,{role: processRole.processManagement, message: "generate process. active version: "+ number[versionCode]})
		return {
			port: undefined,
			status: "success"
		};
	}
}