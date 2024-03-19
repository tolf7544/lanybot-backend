import { VersionName } from "./type.index"


export enum WorkerAction {
	shutdown = "shutdown",
	sendCollection = "sendCollection",
	passPreviousVersionUserList = "passPreviousVersionUserList" 
}

export enum MusicWorkerAction {
	getClientData = "getClientData",
	executeStream = "executeStream",
	skipStream = "skipStream",
	pauseStream = "pauseStream",
	resumeStream = "resumeStream",
	moveNextStream = "moveNextStream",
	movePreStream = "movePreStream",
	clearStream = "clearStream",
}

export enum StreamWorkerAction {
	getClientData = "getClientData",
	commandFailed = "commandFailed",
	commandSuccess = "commandSuccess"
}

export enum CommandType {
	music = "music",
	security = "security"
}

export type PublishFiles = {
	url: string,
	name : VersionName
} 
export type ProcessMessage<T extends keyof typeof ProcessActionType> = {
	type: T,
	versionType: Extract<ProcessType,{type:T}>["versionType"]
	role?: VersionName,
	path?:string,
	message?: WorkerAction | MusicWorkerAction | StreamWorkerAction,
	collection?: string,
	isSlash?: boolean,
	data?: unknown,
	processId: number,
}

export enum ProcessActionType {
worker = "worker",
role = "role" ,
cluster ="cluster",
}

export enum MusicWorkerType {
music = "music",
stream = "stream" ,
clientData ="clientData",
}

type ProcessType = MusicStreamType | RoleMessageType | ClusterMessageType | WrokerMessageType

export type MusicStreamType = {
	type: ProcessActionType.worker,
	versionType: VersionName | keyof typeof MusicWorkerType
}

export type RoleMessageType = {
	type: ProcessActionType.role,
	versionType: VersionName
}

export type ClusterMessageType = {
	type: ProcessActionType.cluster,
	versionType: VersionName
}

export type WrokerMessageType = {
	type: ProcessActionType.worker,
	versionType: VersionName
} 
