import { Status } from "./type.pm"
import net from 'net';

export type  musicIPCdataFormat = {
	youtubeId: string,
	guildId: string,
	memberId: string,
	channelId: string
}

// test type

export type ProcessData = {
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

export type ProcessMessage = Heartbeat | ProcessRegister | ExchangeProcessData

export type Heartbeat = {
	type: "heartbeat",
	time: string,
	role: ProcessRole
}  

export type ProcessRegister = {
	type: "register-request" | "register-response",
	time: string,
	pid: number,
	role: ProcessRole,
	state: Status,
	message: string,
	port: number
}

export type ExchangeProcessData = {
	type: "data-request" | "data-response",
	time: string,
	pid: number,
	role: ProcessRole,
	state: Status,
	userList: string,
}

export type PortConfig = {
	default: number,
	active: Array<number>
} 