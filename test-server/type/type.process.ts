import net from 'net';
import { Status } from './type.util';

export type musicIPCdataFormat = {
	youtubeId: string,
	guildId: string,
	memberId: string,
	channelId: string
}

// test type

export interface ProcessData {
	role: ProcessRole,
	active: boolean,
	client: net.Socket | undefined,
	notRegisterProcess: boolean, // 중앙 버전 관리 프로세스를 이용하지 않음 ( 단독 및 특별한 케이스 )
	legacyUser: Set<string>,
	port: number
}

export type ClientData = Set<string>;

export enum ProcessRole { // 서비스 역할 코드
	"processManagement" = "0000",
	"musicCommand" = "0001",
	"musicDatabase" = "0002",
	"musicStream" = "0003",
	"securitySpam" = "0004",
}

export type ProcessMessage = Heartbeat | ProcessRegister | ExchangeProcessData | ProcessRequest

export interface ProcessMessageFormat {
	time: string,
	pid: number,
	role: ProcessRole,
	state: Status,
	message: string,
}

export type Heartbeat = {
	type: "heartbeat",
	time: string,
	role: ProcessRole,
	checkPoint: Array<number>
}

interface ProcessStatus extends Omit<ProcessData, "client"> {
	isSingleProcessBlock: number
	version: {
		number: number
		UpdateCount: number
	}
	isNeedRestart: boolean

}

export interface ProcessRequest extends ProcessMessageFormat {
	type: "process-data-request" | "process-data-response",
	process: ProcessStatus
}

export interface ProcessRegister extends ProcessMessageFormat {
	type: "register-request" | "register-response",
	port: number
}

export interface ExchangeProcessData extends ProcessMessageFormat {
	type: "data-request" | "data-response",
	userList: string,
}

export type PortConfig = {
	default: number,
	active: Array<number>
}
