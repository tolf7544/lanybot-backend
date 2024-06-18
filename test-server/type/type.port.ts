import { PortError } from './type.error';
import { PortConfig, ProcessData } from './type.process';
import { Status } from './type.util';
import net from 'net';

type ManageSocketConnect = {
	execution: "connect",
	socket: net.Socket | PortError
}

type ManageSocketDisconnect = {
	execution: "disconnect",
	socket: true | PortError
}

type ManageSocketCheckConnection = {
	execution: "connect",
	socket: boolean | PortError
}

type ManageSocketHeartbeat = {
	execution: "heartbeat",
	socket: net.Socket | PortError
}

export type ManageSocketConnectionParams = {
	execution: ManageSocketConnect["execution"] |
	ManageSocketDisconnect["execution"] |
	ManageSocketCheckConnection["execution"] |
	ManageSocketHeartbeat["execution"]
}

export type manageSocketConnectionReturn = {
	input: ManageSocketConnectionParams["execution"]
	status: Status
}

export interface Port {

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