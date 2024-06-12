import net from "net";
import fs from 'fs';
import { PortConfig, ProcessData } from "../type/type.process";
import { Port } from "../type/type.port";
import { PortError, portError } from "../type/type.error";
import { portLogger } from "./log";
/**
 * 
 * @param port 사용할 포트 입력
 * @param callback callback 입력
 */
export function existPortNumber(port: number,callback: CallableFunction) {
    

    if(port >= 10000) {
        /** something is using 9000 ~ 10000 port [error] 
         * log 남겨야함
         * return할 시 process block 등록할때에는 거부 메시지 전송 필요
         */
        return /** p-block 거부 코드 리턴 */
    }

    const server = net.createServer(socket => {
        socket.write('Echo server\r\n');
        socket.pipe(socket);
    });

    server.on('error', () => existPortNumber(port+1, callback));
    server.on('listening', () => (server.close(), callback(port)));

    server.listen(port);
}

export function GetActivePortNumberList(number:number) {
		const portData:PortConfig | number = getPortConfig();
        if(typeof portData == "number") {
            // error 리턴
            return portData;
        }

		let activePort = number;
        
        for(let i = 0; i < 1000; i++) {
            if(activePort in portData.active) {
                activePort += 1;
            } else {
                break;
            }
        }

        return activePort;
}

export function getPortConfig(): PortConfig | number {
    const configPath = "../config/port.json";

    try{
        if(fs.existsSync(configPath)) {
            const portConfig = fs.readFileSync(configPath, "utf-8"); //리눅스 os에서 문제 발생하는지 확인 필요
            const portData:PortConfig = JSON.parse(portConfig);
            return portData;
        } else {
            const portConfig:PortConfig = {
                default: 9001,
                active: []
            }
            
            fs.writeFileSync(configPath,JSON.stringify(portConfig), "utf-8");
            return portConfig;
        }
    }catch(e) {
        /** fs에서 읽어오는데 문제 발생 
         * log남겨야함
         * p-block 등록 시에는 거부 메시지 전송 필요
        */
        return 0/** p-block 거부 코드 리턴 [0 -> 임시]*/
    }
}

console.log(GetActivePortNumberList())



export class port implements Port {
    configPath = "../config/port.json";
    setting: PortConfig;
    maximumPort: number = 65535;
    processData: ProcessData;

    constructor(_processData:ProcessData) {
        this.processData = _processData;
    }


    get data(): PortConfig | PortError {
        try {
            if (fs.existsSync(this.configPath)) {
                const portConfig = fs.readFileSync(this.configPath, "utf-8"); //리눅스 os에서 문제 발생하는지 확인 필요
                const portData: PortConfig = JSON.parse(portConfig);
                return portData;
            } else {
                const portConfig: PortConfig = {
                    default: 9001,
                    active: []
                }

                fs.writeFileSync(this.configPath, JSON.stringify(portConfig), "utf-8");
                return portConfig;
            }
        } catch (e) {
            /** fs에서 읽어오는데 문제 발생 
             * log남겨야함
             * p-block 등록 시에는 거부 메시지 전송 필요
            */
            return "0001"/** p-block 거부 코드 리턴 [0 -> 임시]*/
        }
    }

    isUsingPort(port: number): Promise<boolean> {
        return new Promise<boolean>((resolve:(value: boolean) => void,reject: (error: PortError) => void) => {
            const server = net.createServer(socket => {
                socket.write('Echo server\r\n');
                socket.pipe(socket);
            });
        
            server.on('error', (err) => {
                portLogger(__filename,{
                    role:this.processData.role,
                    message: `${portError["0002"]}\n${err}`
                })
                reject("0002")
            });
            server.on('listening', () => (server.close(), resolve(false)));
        
            server.listen(port);
        })
    }

    getPortNumber(): Promise<number | PortError> {
        const setting = this.data;
        let port: number;

        if(typeof setting == "string") {
            return setting;
        } else {
            this.setting = setting;
            return this.portLoopCheck(setting.default)
        }
    }
    
    portLoopCheck(portNumber: number): Promise<number | PortError> {
        return this.isUsingPort(portNumber).then(() => { /** 사용가능 */
            return portNumber;
        }).catch(() => { /** 사용 불가능 */
            if(portNumber > this.maximumPort) { /** 모든 포트 사용 불가능 경우 */
                return "0003"
            } else {
                portNumber += 1;
                if(portNumber in this.setting.active) {
                    for(let i=0;i < this.setting.active.length; i++) {
                        if(portNumber in this.setting.active) {
                            portNumber += 1;
                            continue;
                        }
                        break;
                    }
                }
                return this.portLoopCheck(portNumber);
            }
        })
    }
}