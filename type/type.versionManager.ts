import { VersionName } from "./type.index"


export enum WorkerAction {
	shutdown = "shutdown",
	sendCollection = "sendCollection",
	passPreviousVersionUserList = "passPreviousVersionUserList" 
}

export enum MusicWorkerAction {
	executeStream = "executeStream",
	skipStream = "skipStream",
	pauseStream = "pauseStream",
	resumeStream = "resumeStream",
	moveNextStream = "moveNextStream",
	movePreStream = "movePreStream",
	clearStream = "clearStream",
}

export enum StreamWorkerAction {
	commandFailed = "commandFailed",
	commandSuccess = "commandSuccess"
}

export enum CommandType {
	music = "music",
	security = "security",
	stream = "stream",
	client = "client"
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
	data?: string,
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

export interface ClientIPCDataForamt {
	id: {
		user: string,
		guild: string,
	}

}
