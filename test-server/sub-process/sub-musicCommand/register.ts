import net from 'net';
import { ProcessData, ProcessRegister } from '../../type/type.process';
import { TodayDate, debugLog } from '../../util/util';

export function registerRequest(client: net.Socket,processData:ProcessData) {
	if(processData.notRegisterProcess == true) {
		debugLog("pass management process registering.")
		return "success";
	}
	debugLog("send register to management process")
	client.write(JSON.stringify({
		type: "register-request",
		time: TodayDate(),
		pid: process.pid,
		role: processData.role,
	} as ProcessRegister))
}