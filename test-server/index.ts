import net from "net";
import { ProcessMessage } from "./type/type.process";
import { ProcessManager } from "./util/processManagement";
import { receiveRegister } from "./master-process/register";
import { debugLog } from "./util/util";
import port from "./config/port.json"
export const pm = new ProcessManager();

const server = net.createServer((connection) => {
	// 'connection' listener.
	console.log('client connected');
	
	connection.on("data", (data) => receiveSoketEvent(connection, data))
	
	connection.on("error", (error) => {
		console.log(error)
		
	})
	connection.on('end', () => {
		console.log('client disconnected');
	});
});

server.listen(port.default, () => {
	console.log('process[master] start');
});

process.on("uncaughtException",(error) => {
	debugLog(JSON.stringify(error))
})

function receiveSoketEvent(connection: net.Socket, data:Buffer) {
	const message:ProcessMessage = JSON.parse(data.toString());
	if(message.type == "register-request") {
		return receiveRegister(connection,message);
	}

	// if(message.type == "heartbeat") {
	// 	return receiveHeartbeat(message);
	// }
}