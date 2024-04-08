export default class MessageFreqFilter {
	collector: Array<{ time: number }> = []
	freq_collector: Array<{ time: number }> = []
	is_freq_loop_on: boolean = false
	maxSec: number
	limit: number
	spamCheckPercentage: number
	constructor(_custom_max_sec: number, _limit: number, _spam_check_percentage: number) {
		this,
		this.maxSec = _custom_max_sec
		this.limit = _limit
		this.spamCheckPercentage = _spam_check_percentage
	}


	added_message() {
		// eslint-disable-next-line no-async-promise-executor
		return new Promise((resolve) => {
			console.log(`[SPAM_DETECTOR] message number [${this.collector.length}] input time:`+new Date().getTime())
			this.collector.push({ time: new Date().getTime() });
			setTimeout(() => {
				this.collector.shift();
			}, 1000 * this.maxSec);

			if (this.collector.length > 2) {
				console.log(`[SPAM_DETECTOR] start spam checking`)
				const result = this.check_freq_sec()
				if (result) {
					resolve(result)
				}
			}
		})
	}
	check_freq_sec(): number | -1 {
		const distance1 = this.collector[1].time - this.collector[0].time
		const distance2 = this.collector[2].time - this.collector[1].time
		const percentage = this.spamCheckPercentage
		//console.log(`[SPAM_DETECTOR] second message and first message difference: ` + distance1)
		//console.log(`[SPAM_DETECTOR] third message and second message difference: ` + distance2)
		const average = (distance1 + distance1) / 2
		const start_area_num = (average) - (average * (percentage / 100))
		//console.log(`[SPAM_DETECTOR] min differnece: ` + start_area_num)
		const close_area_num = (average) + (average * (percentage / 100))
		//console.log(`[SPAM_DETECTOR] max differnece: ` + close_area_num)
		//console.log(start_area_num <= distance2,"  |  ", distance2 <= close_area_num)
		const isDetect = start_area_num <= distance2 && distance2 <= close_area_num
		//console.log(`[SPAM_DETECTOR] check spam: ` + isDetect)
		if (isDetect) {
			console.log(`[SPAM_DETECTOR] spam score: ` + this.caculate_spam_score(distance1, distance2, average))
			return this.caculate_spam_score(distance1, distance2, average)
		} else {
			return -1
		}
	}

	private caculate_spam_score(x: number,y: number, average:number) {
		let temp: number;

		if (x < y) {
			temp = x;
			x = y
			y = temp;
		}

		return (1 - ((x - y) / average))*100
	}
}
