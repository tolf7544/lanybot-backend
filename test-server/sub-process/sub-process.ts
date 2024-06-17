import { ProcessData, ProcessMessage, ProcessRegister, ProcessRole } from "../type/type.process";
import port from "../config/port.json";
import { TodayDate, debugLog } from "../util/util";
import net from 'net';
import { ProcessNet } from "../type/type.pm";
import { PortMessage, portMessage } from "../type/type.error";
import { manageSocketConnectionParams } from "../type/type.port";


export class subProcess implements ProcessNet {
    processData:ProcessData;

    constructor(role:ProcessRole,notRegisterProcess?:boolean) {
        if(!notRegisterProcess) {
            notRegisterProcess = false;
        }

        this.processData = {
            role: role,
            active: false,
            notRegisterProcess: notRegisterProcess,
            legacyUser: new Set(),
            port: 0,
            client: undefined
        }
    
        this.processErrorEvent()
    }

    get clientProcess():PortMessage | net.Socket {
        if(!this.processData.client) {
            return "0011"
        } else {
            return this.processData.client
        }
    }

    /** socket connection management function */

    manageSocketConnection({execution}: manageSocketConnectionParams) {

        if(execution == "check-connection") {
            const testConnection = this.clientProcess;

            if(testConnection == "0011") return /** need  */
        }
    }

    /**  */

    connectManagementProcess() {
        this.processData.client = net.createConnection({ port: port.default }, () => {
	
            const result = this.registerRequest(this.processData.client as net.Socket,this.processData);
        
            if(result == "success") {
                debugLog("process active. [ignore management process]")
                this.processData.active = true;
            }
        });
        
        this.processData.client.on('data', (data) => this.receiveSoketEvent(data));
        this.processData.client.on('end', () => {
            console.log('disconnected from server');
        });
    }

    connectSubProcess(run: CallableFunction) {
        net.createConnection({ port: port.default }, () => {
            run(this.processData.client);
        })
    }

    createServer() {
        
    }

    private receiveSoketEvent(data:Buffer) {
        const message = JSON.parse(data.toString()) as ProcessMessage;
        
        if(message.type == "register-response") {
            if(message.state == "success") {
                debugLog("process active. [received ok sign from management process2]")
                this.processData.active = true;
            } else {
                setTimeout(() => {
                    debugLog("retry register request.")
                    return this.registerRequest(this.processData);
                }, 1000*10);
            }
        }
    }

    private registerRequest(processData:ProcessData) {
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

    private processErrorEvent() {        
        process.on("uncaughtException",(error) => {
            debugLog(JSON.stringify(error))
        })
    }
}