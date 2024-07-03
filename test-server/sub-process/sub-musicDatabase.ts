import { processRole } from "../type/type.process";
import net from 'net';

const role = processRole.musicDatabase


function main() {
    const socket = net.createConnection({ timeout: 5000, port: 6001 }, () => {
        // this.process.client == net.Socket (createConnection 실행 후 net.Socket 리턴 되며 해당 리턴 값을 resolve의 인수값으로 넘김)
        console.log(socket)
    })
}

process.on("uncaughtException", ((error) => {
    console.log(error.name)
}))

main();