import { ProcessData, ProcessRole } from "./type.process"

export type ProcessQueueUnit = Omit<Process, "status">

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

export type Status = "success" | "canceled" | "failed" | "error" 

export interface ProcessNet {
	/**
	 * 
	 * process information
	 * 
	 */
	processData: ProcessData,
	/**
	 * 
	 * connect management process
	 * 
	 * receive ok sign( receiveSoketEvent() ) from pm process & program start
	 */
	connectManagementProcess(): void,
	/**
	 * 
	 * connect another sub process & use connection socket object at callback function.
	 * 
	 */
	connectSubProcess(run:CallableFunction):void,
	/**
	 * 
	 * create connection base when sub process need connection this process.
	 * 
	 */
	createServer():void,
	//private receiveSoketEvent():void
	//private registerRequest(client: net.Socket,processData:ProcessData):"success" | undefined
} 