export default class MessageFreqFilter {
	collector: Array<{time:number}> = []
	freq_collector: Array<{time:number}> = []
	is_freq_loop_on: boolean = false
	maxSec: number
	limit: number

	constructor(_custom_max_sec: number, _limit: number) {
		this.maxSec = _custom_max_sec
		this.limit = _limit
	}


	added_message() {
		// eslint-disable-next-line no-async-promise-executor
		return new Promise((resolve) => {
			this.collector.push({time: new Date().getTime()});
			setTimeout(() => {
				this.collector.shift();
			}, 1000 * this.maxSec);
			
			if(this.collector.length > 2) {
				const result = this.check_freq_sec()
				if(result) {
					resolve(result)
				}
				
			}
		})
	}
	check_freq_sec() {
		const  x = this.collector[1].time - this.collector[0].time
		const  y = this.collector[2].time - this.collector[1].time
		const percentage = 14

		const isDetect = (x+y)/2-(percentage*x+percentage*y)/200 < x && x < (x+y)/2+(percentage*x+percentage*y)/200

		if(isDetect) {
			return true
			} else { 
				0
			}
	}
}
