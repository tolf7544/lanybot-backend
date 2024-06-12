import { PortError } from './type.error';
import { PortConfig } from './type.process';

export interface Port {
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
	get getPortNumber(): Promise<number | PortError>

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
	 */
	portLoopCheck(portNumber: number): Promise<number | PortError>
}