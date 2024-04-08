import { VersionName } from "./type.index"
import { ActionStatus, FailedReason, MusicWorkerAction } from "./type.stream"


export enum WorkerAction {
	shutdown = "shutdown",
	sendCollection = "sendCollection",
	passPreviousVersionUserList = "passPreviousVersionUserList" 
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
export interface ProcessMessage<T extends keyof typeof ProcessActionType> {
	process:Extract<ProcessType,{type:T}>
	role?: VersionName,
	path?:string,
	message?: WorkerAction,
	collection?: string,
	isSlash?: boolean,
	data?: string,
	processId: number,
	targetPid?: number

}

export enum ProcessActionType {
worker = "worker",
music = "music" ,
role = "role" ,
cluster ="cluster",
}

export enum MusicWorkerType {
music = "music",
stream = "stream",
}

type ProcessType = MusicStreamType | RoleMessageType | ClusterMessageType | WrokerMessageType

export type MusicStreamType = {
	type: ProcessActionType.music,
	versionType: VersionName | keyof typeof MusicWorkerType,
	music: {
		action: MusicWorkerAction,
		status: ActionStatus,
		reason?: FailedReason
	}
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

