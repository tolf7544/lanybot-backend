import { Process } from '../type/type.pm';
import { ProcessRole } from '../type/type.process';
export class ProcessManager<K extends number,V extends Process> extends Map<K,V> {
	constructor() {
		super();
	}

	/**
	 * @param target 찾을려는 문자열 입력
	 * @param findOption 탐색범위를 key 또는 value 지정
	 */
	findEntry(target: number | ProcessRole, findOption: "key" | "value"): null | K[] | V[] {
		let temp: K[] |  V[];

		if(findOption == "key") {
			temp = Array.from(this.keys()).filter((_e) => {return _e == target})
		} else {
			temp = Array.from(this.values()).filter((_e) => {return Object.entries(_e).filter(([,_v]) => {return _v == target}).length > 0})
		}
		if(temp.length == 0) {
			return null
		} else {
			return temp
		}
	}
}