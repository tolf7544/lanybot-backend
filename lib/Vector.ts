

export class Vector extends Array<number> {

	constructor(numberArr: number[]) {
		super();
		this.push(...numberArr)
	}


	multiplyVec(self: number[] | number,target: number[] | number): Vector {
		const temp: Vector = new Vector([])
		
		if(!self) {
			self = Array.from(this.values()) as number[]
		}
		
		if(typeof(self) == "number" && typeof target == "object") {
			for(let i = 0; i < target.length; i++) {
				temp.push(self * target[i])
			}
		}else if(typeof(self) == "object" && typeof target == "number") {
			for(let i = 0; i < self.length; i++) {
				temp.push(self[i] * target)
			}
		} else if(typeof self ==  "object" && typeof target == "object"){
			for(let i = 0; i < self.length; i++) {
				temp.push(self[i] * target[i])
			}
		}

		return temp
	}

	divideVec(self: number[] | number,target:number[] | number): Vector {
		const temp: Vector = new Vector([])
		
		if(!self) {
			self = Array.from(this.values()) as number[]
		}
		if(typeof(self) == "number" && typeof target == "object") {
			for(let i = 0; i < target.length; i++) {
				temp.push(self / target[i])
			}
		}else if(typeof(self) == "object" && typeof target == "number") {
			for(let i = 0; i < self.length; i++) {
				temp.push(self[i] / target)
			}
		} else if(typeof self ==  "object" && typeof target == "object"){
			for(let i = 0; i < self.length; i++) {
				temp.push(self[i] / target[i])
			}
		}

		return temp
	}

	get VectorSize() {
		const temp = []
		for (const num of this.multiplyVec(Array.from(this.values()),Array.from(this.values()))) {
			temp.push(Math.sqrt(num))
		}

		return temp;
	}

	dot(target: Vector): number {
		let temp = 0

		for(let i = 0; i < target.length; i++) {
			temp += Array.from(this.values())[i] * target[i]
		}

		return temp
	}

	colaboration(target?: Vector) {
		let temp = 0

		if(!target) {
			for(const num of this.values()) {
				temp += num
			}
		} else {
			for(const num of target) {
				temp += num
			}
		}
		return temp
	}
}