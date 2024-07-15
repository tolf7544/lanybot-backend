import { processRole } from "../type/type.process";
import net from 'net';
import { portLogger, simpleJsonLogger } from "../util/log";
import { JsonLog, PortLogDataType } from "../type/type.pm";
import { debugLog } from "../util/util";

const role = processRole.musicDatabase
const port = 9001

function main() {
    setInterval(() => {
        debugLog("test")
    }, 5000);
    simpleJsonLogger(__filename,
        {
            execute: "save"
        },
        {
            role: `port.${role}.${port}`,
            object: {
                port: port,
                status: "start"
            }
        })

    const socket = net.createConnection({ timeout: 5000, port: port }, () => {
        // this.process.client == net.Socket (createConnection 실행 후 net.Socket 리턴 되며 해당 리턴 값을 resolve의 인수값으로 넘김)
        simpleJsonLogger(__filename,
            {
                execute: "save"
            },
            {
                role: `port.${role}.${port}`,
                object: {
                    port: port,
                    status: "success"
                }
            })
    })
}

/**
 * 
 * port 처리되지 않은 포트 오류 이벤트 처리
 * 
 */
process.on("uncaughtException", ((error) => {

    if (error.name == "AggregateError") {
        const portLog = simpleJsonLogger(
            __filename,
            {
                execute: "read"
            },
            {
                role: `port.${role}.${port}`,
            }
        ) as JsonLog<PortLogDataType>

        if (portLog.data.status == "start") { // port connecting is failed.
            portLogger(__filename, {
                role: role,
                message: `socket connection failed. [more info] ${JSON.stringify(portLog)}`
            })
        }
    }


}))

main();