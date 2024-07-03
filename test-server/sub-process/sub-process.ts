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
    process: ProcessData;
    portSetting: portManager;

    constructor(role: ProcessRoleCode, notRegisterProcess?: boolean) {
        if (!notRegisterProcess) {
            notRegisterProcess = false;
        }

        this.process = {
            role: role,
            active: false,
            notRegisterProcess: notRegisterProcess,
            legacyUser: new Set(),
            port: 0,
            client: undefined,
            registerPatient: 0,
            maximumPatient: 10
        }

        this.portSetting = new portManager(this.process);

        this.processErrorEvent()
    }

    get socket(): SubProcessError | net.Socket {
        if (!this.process.client || this.process.client.connecting == false) {
            return "0012"
        } else {
            return this.process.client
        }
    }


    /** socket connection management function */

    manageSocketConnection({ execution, option }: manageSocketConnectionParams): manageSocketConnectionReturn {
        let socket = this.socket;
        const isSocketUseable = typeof socket != "string" ? true : false;
        socket = socket as net.Socket

        if (execution == "connect" && option == undefined) {
            return {
                input: execution,
                status: "cancel",
                result: "0004",
                type: "sync"
            };
        }

        if (execution == "check-connection") {
            if (isSocketUseable) {
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
                    result: false,
                    type: "sync"
                };
            }

        } else if (execution == "connect") {
            if (isSocketUseable) {
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
                    result: this.connectServer(),
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
                    role: this.process.role,
                    checkPoint: [functionCode["port management class"]]
                }
            }
        }
    }

    private connectServer(port: number) {
        return new Promise((resolve: (value: net.Socket) => void, reject: (error: PortError) => void) => {

            const socket = net.createConnection({ timeout: 5000, port: port }, () => {
                // this.process.client == net.Socket (createConnection 실행 후 net.Socket 리턴 되며 해당 리턴 값을 resolve의 인수값으로 넘김)
                resolve(socket);
            })
        })
    }

    private spawnServer() {
        return new Promise((resolve: (value: net.Socket) => void, reject: (error: PortError) => void) => {
            this.portSetting.getPortNumber().then((portNumber) => {
                const socket = net.createConnection({ port: portNumber }, () => {
                    // this.process.client == net.Socket (createConnection 실행 후 net.Socket 리턴 되며 해당 리턴 값을 resolve의 인수값으로 넘김)
                    resolve(socket);
                })
            }).catch((error: PortError) => {
                reject(error);
            })
        })
    }
    /** main socket connection management function */
    // manageMainSocket({ execution }: ManageMainSocketConnectionParams): Promise<ManageMainSocketConnectionReturn> | ManageMainSocketConnectionReturn  {
    //     return new Promise((resolve, reject: (error: ManageMainSocketConnectionReturn) => void) => {
    //         if (execution == "Main-check-connection") { // main process 단일 확인 메서드

    //         } else if (execution == "Main-check-socket-integrity") {  // main process에서 시작되며 요청된 해당 서비스 전반을 확인하는 메서드

    //         } else if (execution == "Main-data-request") {

    //         } else { //Main-register-process
    //             this.registerManagementProcess().then(() => { //success
    //                 resolve({
    //                     input: "Main-register-process",
    //                     result: true,
    //                     status: "success",
    //                     type: "async"
    //                 })
    //             }).catch((code: SubProcessError) => { // 0021
    //                 processLogger(__filename, {
    //                     role: this.process.role,
    //                     message: subProcessError[code]
    //                 })
    //                 reject({
    //                     input: "Main-register-process",
    //                     result: false,
    //                     status: "fail",
    //                     type: "async"
    //                 })
    //             })
    //         }
    //     })
    // }
    /** manageMainSocket Main-data-request */


    /** manageMainSocket Main-register-process */
    private registerManagementProcess() {
        return new Promise((resolve: (value: Status) => void, reject: (code: SubProcessError) => void) => {
            const mainProcessSocket = net.createConnection({ port: port.default }, () => {
                const result = this.registerRequest(mainProcessSocket);

                if (result == "success") {
                    debugLog("process active. [ignore management process]")
                    this.process.active = true;
                }
            });

            mainProcessSocket.on('data', (data) => {
                this.receiveSoketEvent(mainProcessSocket, data).then((result) => {  // pending / success
                    if (result != "pending") {
                        resolve(result)
                    }
                }).catch((code) => {
                    reject(code)
                })
            });

            mainProcessSocket.on('end', () => {
                console.log('disconnected from server');
            });
        })

    }
    /**
     * manageMainSocket Main-register-process
     * 
     * resolve( pending or success connected )
     * reject( SubProcessError 0021 occured )
     * 
     */
    private receiveSoketEvent(socket: net.Socket, data: Buffer): Promise<Status> {
        return new Promise((resolve, reject: (error: SubProcessError) => void) => {
            const message = JSON.parse(data.toString()) as ProcessMessage;

            if (message.type == "register-response") {
                if (message.state == "success") {
                    debugLog("process active. [received ok sign from management process2]")
                    this.process.active = true;
                    this.process.registerPatient = 0;
                } else {
                    // 실패했을때 최대 시도 횟수와 같거나 이상인지 확인
                    if (this.process.registerPatient == this.process.maximumPatient) {
                        reject("0011")
                    } else {
                        setTimeout(() => {
                            debugLog("retry register request.")
                            this.process.registerPatient += 1;
                            this.registerRequest(socket, resolve);
                        }, 1000 * 10);
                    }
                }
            }
        })
    }

    /**
     * manageMainSocket Main-register-process
     * 
     * 해당 함수는 receiveSoketEvent() 매서드에 포함되어 있었으나 등록 재시도 절차를 구현하기 위해 함수로 분리시킴
     * resolve 함수는 receiveSoketEvent()에서 사용할 목적으로 작성된 파라미터이며 이외 사용목적에 맞지 않음
     * 
     * @param socket {net.Socket}
     * @param resolve {function}
     * 
     * @returns [ success ] 프로세스 등록 절차 무시 후 서비스 개시
     * @returns [ pending ] 등록 요청 전송. 보류 상태 뜻함
     */

    private registerRequest(socket: net.Socket, resolve?: CallableFunction): Status {
        if (this.process.notRegisterProcess == true) {
            debugLog("pass management process registering.")

            if (resolve) {
                resolve("success");
            }
            return "success";
        }
        debugLog("send register to management process");

        socket.write(JSON.stringify({
            type: "register-request",
            time: TodayDate(),
            pid: process.pid,
            role: this.process.role,
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