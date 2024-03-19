
import { Vector } from '../../../lib/Vector';

export default class MessageFilter {
	collector: Array<string[]> = []

	maxSec: number
	limit: number
	type: "jamo" | "char" = "char"

	constructor(_customMS: number, _limit: number,_type?: "jamo" | "char") {
		this.maxSec = _customMS
		this.limit = _limit

		if(_type) {
			if(_type == "jamo") {
				this.type = "jamo"
			}
		}
	}

	sentence_transfor(sentence: string): string[] {
		if(this.type == "char") {
			return Array.from(sentence)
		} else {
			return this.sentence_transfor(sentence)
		}
	}

	add_message(content: string) {
		this.collector.push(this.sentence_transfor(content))
		const simulator_persentage = this.caculate_cos_sim(content)
		if(typeof simulator_persentage == "number") {
			if(typeof simulator_persentage == "object") {
				/** 유사도 기반 */
			} else if(simulator_persentage > this.limit) {
				/** 빈도 기반 */
					return [
						simulator_persentage,
						this.collector
					]
				}
			}

			setTimeout(() => {
				this.collector.shift()
			}, 1000 * this.maxSec);
		}

	caculate_cos_sim(target?:string) {
		if(this.collector.length == 1) return null

		if(!target) {
			const temp = this.collector.pop()

			if(temp) {
				target = temp[0]
			} else {
				return null;
			}
		}
		const Vec = new Vector([]);
		const correct = []

		for(const sentence of this.collector) {
			const collector_matrix = this.get_matrix([sentence])
			const target_matrix = this.get_matrix([this.sentence_transfor(target)])

			correct.push(Vec.divideVec(
				Vec.multiplyVec(collector_matrix.VectorSize,target_matrix.VectorSize),
				collector_matrix.dot(target_matrix)
			).colaboration())
		}


		return correct

	}


	get matrix() {
		const matrix = new Map();
		if (this.collector.length > 0) {
			const temp = []
			for(const jamoArr of this.collector) {
				for(const jamo of jamoArr) {
					temp.push(jamo);
				}
			}

			for (const key of new Set(temp)) {
				matrix.set(key, 0)
			}

			return matrix
		} else {
			return matrix
		}

	}


	private get_matrix(target: Array<string[]>):Vector {
		const _matrix = this.matrix

		for (const _content of target) {
			for (const word of _content) {
				// eslint-disable-next-line no-prototype-builtins
				if (_matrix.has(word)) {
					_matrix.set(
						word,
						_matrix.get(word) + 1
					)
				} else {
					_matrix.set(
						word,
						1
					)
				}
			}
		}
		return new Vector(Array.from(_matrix.values()))
	}
}
