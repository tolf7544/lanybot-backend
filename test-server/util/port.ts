import net from "net";
import fs from 'fs';
import { PortConfig, ProcessData } from '../type/type.process';
import { PortManager } from "../type/type.port";
import { PortError, portError } from "../type/type.error";
import { portLogger } from "./log";


export class portManager implements PortManager {
    configPath = __dirname.replace("util","config/")+"port.json";
    info: PortConfig;
    maximumPort: number = 65535;
    process: ProcessData;


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

    saveData() {
        fs.writeFileSync(this.configPath, JSON.stringify(this.info), "utf-8");
    }
 
    isUsingPort(port: number): Promise<boolean> {
        return new Promise<boolean>((resolve:(value: boolean) => void,reject: (error: PortError) => void) => {
            const server = net.createServer((/*socket*/) => { /** empty */});
        
            server.on('error', (err) => {
                portLogger(__filename,{
                    role:this.process.role,
                    message: `${portError["0002"]}\n${err}`
                })
                reject("0002")
            });
            server.on('listening', () => (server.close(), resolve(false)));
        
            server.listen(port);
        })
    }

    getPortNumber(): Promise<number> {
        return new Promise<number>((resolve: (value:number) => void, reject: (err: PortError) => void) => {
            const setting = this.data;

            if(typeof setting == "string") {
                return reject(setting);
            } else {
                this.info = setting;
                this.portLoopCheck(setting.default).then((value) => {
                    if(typeof value == "string") {
                        reject(value);
                    } else {
                        resolve(value);
                    }
                })
            }
        })
    }
    
    private portLoopCheck(portNumber: number): Promise<number | PortError> {
        return this.isUsingPort(portNumber).then(() => { /** 사용가능 */
            if(this.info.active.includes(portNumber)) {
                const index = this.info.active.indexOf(portNumber);
                this.info.active.splice(index, 1);
                this.saveData();
            }

            return portNumber;
        }).catch(() => { /** 사용 불가능 */
            if(portNumber > this.maximumPort) { /** 모든 포트 사용 불가능 경우 */
                return "0003"
            } else {
                if(!this.info.active.includes(portNumber)) {
                    this.info.active.push(portNumber)
                    this.saveData();
                }

                portNumber += 1;
                if(portNumber in this.info.active) {
                    for(let i=0;i < this.info.active.length; i++) {
                        if(portNumber in this.info.active) {
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