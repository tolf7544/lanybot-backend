import { PortError } from './type.error';
import { Heartbeat, PortConfig, ProcessData, ProcessMessage } from './type.process';
import { Status } from './type.util';
import net from 'net';
import { InitalCode } from './type.code';


/** management another process socket(not management process) */
type ManageSocketConnect = {
	execution: "connect",
	result: net.Socket | PortError
	option: {
		port: number,
		timeout: number
	}
}

type ManageSocketCheckConnection = {
	execution: "check-connection",
	result: boolean | PortError
}

type ManageSocketHeartbeat = {
	execution: "heartbeat",
	result: Heartbeat | PortError
}

type ManageSocketMethod = ManageSocketConnect |
ManageSocketCheckConnection |
ManageSocketHeartbeat

export type manageSocketConnectionParams = {
	execution: ManageSocketMethod["execution"]
}

export type manageSocketConnectionReturn = {
	input: ManageSocketMethod["execution"]
	result: ManageSocketMethod["result"] | Promise<net.Socket>
	status: Status
	type: "sync" | "async"
}

/** management master process socket(not control sub process) */

type CheckMasterSocketConnection = {
	execution: "master-check-connection",
	result: boolean | PortError
}

type ManageMasterSocketAction<T> = {
	execution: "master-data-request",
	header: ProcessMessage["type"],
	body: unknown,
	result: T | PortError,
}

type RequestMasterHeartbeat = {
	execution: "master-check-socket-integrity",
	result: number[] | PortError,
}

type ManageMasterSocketMethod<T> = CheckMasterSocketConnection |
ManageMasterSocketAction<T> |
RequestMasterHeartbeat

/** default status is pending */
export type manageMasterSocketConnectionReturn<T> = {
	input: ManageMasterSocketMethod<never>["execution"]
	
	result: Promise<ManageMasterSocketMethod<T>["result"]>
	status: Status
	type: "sync" | "async"
}

export type manageMasterSocketConnectionParams = {
	execution: ManageMasterSocketMethod["execution"]
}

export interface Port {
	InitalCode: InitalCode["Port"]
	configPath: string;
	info: PortConfig;
	maximumPort: number;
	processData: ProcessData;

	/**
	 * config/port.json 정보 가져오는 get 함수
	 * 
	 * @returns [success] -> PortConfig 리턴
	 * @returns [error] -> PortError 리턴
	 */
	get data(): PortConfig | PortError,

	/**
	 * 입력된 포트가 사용가능한지 확인하는 promise 함수
	 * 
	 * @param port 
	 * 사용가능한 포트 확인 대상
	 * 
	 * 
	 * @returns Boolean
	 * [success] -> 입력된 포트의 사용 가능
	 * 
	 * @returns PortError
	 * [error] -> 입력된 포트 사용 불가능 (logging)
	 */
	isUsingPort(port: number): Promise<boolean>,

	/**
	 * 사용가능한 포트 리턴
	 * 
	 * @returns number
	 * [success] -> 사용가능한 포트 리턴
	 * 
	 * @returns PortError
	 * [error] -> 에러코드 리턴
	 */
	getPortNumber(): Promise<number | PortError> | PortError;

	/**
	 * 사용가능한 포트를 반복하여 확인 후 리턴
	 * 
	 * @param portNumber
	 * 
	 * @returns number
	 * [success] -> 사용가능한 포트 리턴
	 * 
	 * @returns PortError
	 * [error] -> 에러코드 리턴
	 * 
	 * private portLoopCheck(portNumber: number): Promise<number | PortError>
	 */

	/**
	 * config.port.json 정보를 수정함
	 * 
	 * private editData(data: string): void;
	*/

}