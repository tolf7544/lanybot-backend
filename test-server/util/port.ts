import net from "net";
import fs from 'fs';
import { PortConfig } from "../type/type.process";

/**
 * 
 * @param port 사용할 포트 입력
 * @param callback callback 입력
 */
export function existPortNumber(port: number,callback: CallableFunction) {
    const server = net.createServer(socket => {
        socket.write('Echo server\r\n');
        socket.pipe(socket);
    });

    server.on('error', () => existPortNumber(port, callback));
    server.on('listening', () => (server.close(), callback(port)));

    server.listen(port);
}


export function changeActivePortNumber(number:number) {
	try {
		const portConfig = fs.readFileSync(`${__dirname.replace("util/","config/")}port.json`, "utf-8");
		const portData:PortConfig = JSON.parse(portConfig);
		portData.active.filter()
	
	} catch (error) {
		/** */
	}
	
}
