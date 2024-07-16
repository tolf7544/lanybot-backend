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
	role: ProcessRoleCode,
	active: boolean,
	client: net.Socket | undefined,
	notRegisterProcess: boolean, // 중앙 버전 관리 프로세스를 이용하지 않음 ( 단독 및 특별한 케이스 )
	legacyUser: Set<string>,
	port: number,
	registerPatient: number,
	timeout: number
	maximumPatient:number,// default: 10
}

export type ClientData = Set<string>;

export const processRole = { // 서비스 역할 코드
	"processManagement": "0000",
	"musicCommand": "0001",
	"musicDatabase": "0002",
	"musicStream": "0003",
	"securitySpam": "0004",
} as const
const processRoleValue = Object.values(processRole)
const processRoleKey = Object.keys(processRole)[0] as keyof typeof processRole
export type ProcessRoleCode = typeof processRoleValue[0];
export type ProcessRoleName = typeof processRoleKey;

export type ProcessMessage = Heartbeat | ProcessRegister | ExchangeProcessData | ProcessRequest

export interface ProcessMessageFormat {
	time: string,
	pid: number,
	role: ProcessRoleCode,
	state: Status,
	message: string,
}

export type Heartbeat = {
	type: "heartbeat",
	time: string,
	role: ProcessRoleCode,
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
	process: ProcessStatus,
	target: "process-information" | "process_blocks-integrity-information " 
}

export interface ProcessRegister extends ProcessMessageFormat {
	type: "register-request" | "register-response",
	port: number
}

export interface ExchangeProcessData extends ProcessMessageFormat {
	type: "user-data-request" | "user-data-request",
	userList: string,
}

export type PortConfig = {
	default: number,
	active: Array<number>
}
