import { portManager } from "../util/port"
import { manageSocketConnectionParams, manageSocketConnectionReturn } from "./type.port"
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

/** service process type  */



export interface ServiceProcess {
	
	/**
	 * 서비스(smp아래에 있는 모든 프로세스)가 정상적으로 작동하는지 확인 
	 */
	CheckServiceIntegrity(): void, /** 수정필요 */
	/**
	 * 모든 서비스의 제공 정보를 반환 
	 * 
	 * 제공 데이터 타입 추가 필요 **
	 */
	getServiceInfo():void,
	/**
	 * 모든 서비스의 연결 상태 반환
	 * smp에 저장되어 있는 정보와 일치하지 않는 서비스는 무결성 검사 후
	 * 문제 발견시 저장 및 해당 프로세스 다운 및 아닐경우 정보 업데이트
	 * 
	 * 제공 데이터 타입 추가 필요 **
	 */
	checkServiceConnecting(): void,

	managementServiceScale(): void,

	increaseService(): void

	subtractService(): void

	
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

	/*
	execute "connect" | "check-connection" | "heartbeat" command to another process block(sub management process)
	*/
	manageSocketConnection({ execution, option }: manageSocketConnectionParams): manageSocketConnectionReturn
	
	/**
	 * 
	 * prviate function description need write here.
	 * 
	 */
} 