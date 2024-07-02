import { ProcessData, ProcessMessage, ProcessRegister, ProcessRoleCode } from "../type/type.process";
import port from "../config/port.json";
import { TodayDate, debugLog } from "../util/util";
import net from 'net';
import { SubProcess, functionCode } from "../type/type.pm";
import { PortError, SubProcessError, subProcessError } from '../type/type.error';
import { ManageMainSocketConnectionParams, ManageMainSocketConnectionReturn, manageSocketConnectionParams, manageSocketConnectionReturn } from '../type/type.port';
import { portManager } from "../util/port";
import { processLogger } from "../util/log";
import { Status } from "../type/type.util";


export class subProcess implements SubProcess {
    processData: ProcessData;
    portSetting: portManager;

    constructor(role: ProcessRoleCode, notRegisterProcess?: boolean) {
        if (!notRegisterProcess) {
            notRegisterProcess = false;
        }

        this.processData = {
            role: role,
            active: false,
            notRegisterProcess: notRegisterProcess,
            legacyUser: new Set(),
            port: 0,
            client: undefined,
            registerPatient: 0,
            maximumPatient: 10
        }

        this.portSetting = new portManager(this.processData);

        this.processErrorEvent()
    }

    get clientProcess(): PortMessage | net.Socket {
        if (!this.processData.client) {
            return "0011"
        } else {
            return this.processData.client
        }
    }


    /** socket connection management function */

    manageSocketConnection({ execution }: manageSocketConnectionParams): manageSocketConnectionReturn {
        let socket = this.clientProcess;
        const isClientNull = socket == "0011" ? true : false;
        const isConnecting = socket != "0011" ? socket.connecting : false;
        const isClientConnect = isClientNull && isConnecting ? true : false;
        socket = socket as net.Socket

        if (execution == "check-connection") {
            if (isClientConnect) {
                return {
                    input: execution,
                    status: "success",
                    result: true,
                    type: "sync"
                };
            } else {
                return {
                    input: execution,
                    status: "success",
                    result: true,
                    type: "sync"
                };
            }

        } else if (execution == "connect") {
            if (isClientConnect) {
                return {
                    input: execution,
                    status: "success",
                    result: socket,
                    type: "sync"
                };
            } else {
                return {
                    input: execution,
                    status: "pending",
                    result: this.connectSocket(),
                    type: "async"
                }
            }
        } else { // heartbeat
            return {
                input: "heartbeat",
                status: "pending",
                type: "async",
                result: {
                    type: "heartbeat",
                    time: TodayDate(),
                    role: this.processData.role,
                    checkPoint: [functionCode["port management class"]]
                }
            }
        }
    }

    private connectSocket() {
        return new Promise((resolve: (value: net.Socket) => void, reject: (error: PortError) => void) => {
            this.portSetting.getPortNumber().then((portNumber) => {
                this.processData.client = net.createConnection({ port: portNumber }, () => {
                    // this.processData.client == net.Socket (createConnection 실행 후 net.Socket 리턴 되며 해당 리턴 값을 resolve의 인자값으로 넘김)
                    resolve(this.processData.client as net.Socket);
                })
            }).catch((error: PortError) => {
                reject(error);
            })
        })
    }
    /**  */
    manageMainSocket({ execution }: ManageMainSocketConnectionParams): Promise<ManageMainSocketConnectionReturn> | ManageMainSocketConnectionReturn  {
        return new Promise((resolve, reject: (error: ManageMainSocketConnectionReturn) => void) => {
            if (execution == "Main-check-connection") { // main process 단일 확인 메서드

            } else if (execution == "Main-check-socket-integrity") {  // main process에서 시작되며 요청된 해당 서비스 전반을 확인하는 메서드

            } else if (execution == "Main-data-request") {

            } else { //Main-register-process
                this.registerManagementProcess().then(() => { //success
                    resolve({
                        input: "Main-register-process",
                        result: true,
                        status: "success",
                        type: "async"
                    })
                }).catch((code: SubProcessError) => { // 0021
                    processLogger(__filename, {
                        role: this.processData.role,
                        message: subProcessError[code]
                    })
                    reject({
                        input: "Main-register-process",
                        result: false,
                        status: "fail",
                        type: "async"
                    })
                })
            }
        })
    }

    private registerManagementProcess() {
        return new Promise((resolve: (value: Status) => void, reject: (code: SubProcessError) => void) => {
            this.processData.client = net.createConnection({ port: port.default }, () => {
                const result = this.registerRequest(this.processData);

                if (result == "success") {
                    debugLog("process active. [ignore management process]")
                    this.processData.active = true;
                }
            });

            this.processData.client.on('data', (data) => {
                this.receiveSoketEvent(data).then((result) => {  // pending / success
                    if (result != "pending") {
                        resolve(result)
                    }
                }).catch((code) => {
                    reject(code)
                })
            });

            this.processData.client.on('end', () => {
                console.log('disconnected from server');
            });
        })

    }
    /**
     * 
     * resolve( pending or success connected )
     * reject( SubProcessError 0021 occured )
     * 
     */
    private receiveSoketEvent(data: Buffer): Promise<Status> {
        return new Promise((resolve, reject: (error: SubProcessError) => void) => {
            const message = JSON.parse(data.toString()) as ProcessMessage;

            if (message.type == "register-response") {
                if (message.state == "success") {
                    debugLog("process active. [received ok sign from management process2]")
                    this.processData.active = true;
                    this.processData.registerPatient = 0;
                } else {
                    // 실패했을때 최대 시도 횟수와 같거나 이상인지 확인
                    if (this.processData.registerPatient == this.processData.maximumPatient) {
                        reject("0021")
                    } else {
                        setTimeout(() => {
                            debugLog("retry register request.")
                            this.processData.registerPatient += 1;
                            this.registerRequest(this.processData, resolve);
                        }, 1000 * 10);
                    }
                }
            }
        })
    }

    /**
     * 
     * 
     * 해당 함수는 receiveSoketEvent() 매서드에 포함되어 있었으나 등록 재시도 절차를 구현하기 위해 함수로 분리시킴
     * resolve 함수는 receiveSoketEvent()에서 사용할 목적으로 작성된 파라미터이며 이외 사용목적에 맞지 않음
     * 
     * @param processData {ProcessData}
     * @param resolve {function}
     * 
     * @returns [ success ] 프로세스 등록 절차 무시 후 서비스 개시
     * @returns [ pending ] 등록 요청 전송. 보류 상태 뜻함
     */

    private registerRequest(processData: ProcessData, resolve?: CallableFunction): Status {
        if (processData.notRegisterProcess == true) {
            debugLog("pass management process registering.")

            if (resolve) {
                resolve("success");
            }
            return "success";
        }
        debugLog("send register to management process");

        /** this private function is called at connectManagementProcess().
         *  parent function is checked this client params is exist.
         *  so this case define [net.socket] using "as". */
        (processData.client as net.Socket).write(JSON.stringify({
            type: "register-request",
            time: TodayDate(),
            pid: process.pid,
            role: processData.role,
        } as ProcessRegister));

        if (resolve) {
            resolve("pending");
        }
        return "pending";
    }

    private processErrorEvent() {
        process.on("uncaughtException", (error) => {
            debugLog(JSON.stringify(error))
        })
    }
}