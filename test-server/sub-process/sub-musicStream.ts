import net from "net";
import { ProcessRole } from "../type/type.process";
import { heartBeat } from "../util/util";
import port from "../config/port.json";

const role = ProcessRole.musicStream

const client = net.createConnection({ port: port.default }, () => {
	// 'connect' listener.
	console.log('connected to server!');

	heartBeat(client,role)

	client.write('world!\r\n');
});

client.on('data', (data) => {
	console.log(data.toString());
	// client.end();
});
client.on('end', () => {
	console.log('disconnected from server');
});