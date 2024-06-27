import { portManager } from "../util/port"
import { manageSocketConnectionParams, manageSocketConnectionReturn } from "./type.port"
import { ProcessData, ProcessRole } from "./type.process"

export type ProcessQueueUnit = Omit<Process, "status">


export const functionCode = {
	"sub process Management class": 1,
	"port Management class": 2
}

export type Process = {
	role: ProcessRole,
	version: number,
	port: number,
	status: "previous" | "active" | "loading",
}

export type Log = {
	role: ProcessRole,
	message: string
}

export interface ProcessNet {
	/**
	 * 
	 * process information
	 * 
	 */
	processData: ProcessData,
	/**
	 * 
	 * set port config data and get useable port. 
	 * 
	 */
	portSetting: portManager,
	/**
	 * 
	 * manage socket connection / integrity / connection check
	 * 
	 */
	manageSocketConnection({ execution }: manageSocketConnectionParams): manageSocketConnectionReturn,
	/**
	 * 
	 * connect Master process. (not connect another sub process. only Master process.)
	 * 
	 */
	connectMasterProcess(run: CallableFunction): void

	/**
	 *  hide private function 
	 * 
	 *  < socket connection Master function > 
	 * 1. connectSocket
	 * : connection another process. when success call resolve and failed call reject. (promise)
	 * 
	 *  < connection Master process >
	 * 1. receiveSoketEvent
	 * 2. registerRequest
	 * 3. processErrorEvent
	 * : catch unexpected process error. 
	 * 
	*/
} 