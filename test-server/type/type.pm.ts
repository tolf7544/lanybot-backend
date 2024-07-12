import { portManager } from "../util/port"
import { ProcessData, ProcessRoleCode } from "./type.process"
import { Status } from "./type.util"

export type ProcessQueueUnit = Omit<Process, "status">


export const functionCode = {
	"sub process management class": 1,
	"port management class": 2
}

export type Process = {
	role: ProcessRoleCode,
	version: number,
	port: number,
	status: "previous" | "active" | "loading",
}

/** log type */
export type Log = {
	role: ProcessRoleCode,
	message: string
}

export type LogOption = {
	execute: "save" | "read"
}

export type JsonLogParams<T> = {
	role: ProcessRoleCode | `${"port"}.${ProcessRoleCode}.${number}`,
	object?: T
}

export type JsonLog<T> = {
	date: number,
	filename: string,
	data: T
}

export type PortLogDataType = {
	port: number,
	status: Status
}
/**  */

export interface SubProcess {
	/**
	 * 
	 * process information
	 * 
	 */
	process: ProcessData,
	/**
	 * 
	 * set port config data and get useable port. 
	 * 
	 */
	portSetting: portManager,
	/**
	 * 
	 * manage main socket connection (connect, check integrity, data request) 
	 * 
	 */
	//manageMainSocket({ execution }: ManageMainSocketConnectionParams): Promise<ManageMainSocketConnectionReturn> | ManageMainSocketConnectionReturn,
	/**
	 * 
	 * manage socket connection / integrity / connection check
	 * 
	 */

	/**
	 *  hide private function 
	 * 
	 *  < socket connection Main function > 
	 * 1. connectSocket
	 * : connection another process. when success call resolve and failed call reject. (promise)
	 * 
	 *  < connection Main process >
	 * 1. receiveSoketEvent
	 * 2. registerRequest
	 * 3. processErrorEvent
	 * : catch unexpected process error. 
	 * 
	*/
} 