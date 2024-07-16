/**
 * error message format
 * 
 * file (class) function reason
 * 
 */

export const portError = {
	"0001": "[ port.port.'get data()' ] fs.readFileSync error occured",
	"0002": "[ port.port.isUsingPort() ] already using port. try next port...",
	"0003": "[ port.port.portLoopCheck() ] all port is not useable. try again later.",
	"0004": "[ port.port.manageSocketConnection() ] this command need option data.",
} as const


export const subProcessError = {
	"0011": "[ sub-process.subProcess.registerManagementProcess() ] register request number is over than processData.registerPatient",
	"0012": "[ sub-process.subProcess.clientProcess() ] this.processData.client need reconnecting.",
	"0013": "[ sub-process.subProcess.requestProcessBlockDataReceiveSocketEvent() ] timeout. ( socket didnt received any data. )",
	"0014": "[ sub-process.subProcess.checkMainPorcessConnection() ] connection failed."
}

export type PortError = keyof typeof portError;
export type SubProcessError = keyof typeof subProcessError;

export type PMError = PortError |
SubProcessError