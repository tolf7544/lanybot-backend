import { PortError } from './type.error';
import { PortConfig } from './type.process';

export interface Port {
	/**
	 * success
	 * 포트정보( @type PortConfig ) 리턴
	 * 
	 * error
	 * 에러코드 리턴 ( @type PortError )
	 */
	get data(): PortConfig | PortError,

	/**
	 * success
	 * 사용가능한 포트정보 리턴
	 * 
	 * error
	 * 에러코드 리턴 ( @type PortError )
	 */
	get existPort(): number | PortError
}