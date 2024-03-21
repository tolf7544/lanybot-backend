export default class MessageFreqFilter {
	collector: Array<{ time: number }> = []
	freq_collector: Array<{ time: number }> = []
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
			this.collector.push({ time: new Date().getTime() });
			setTimeout(() => {
				this.collector.shift();
			}, 1000 * this.maxSec);

			if (this.collector.length > 2) {
				const result = this.check_freq_sec()
				if (result) {
					resolve(result)
				}

			}
		})
	}
	check_freq_sec(): number | -1 {
		const x = this.collector[1].time - this.collector[0].time
		const y = this.collector[2].time - this.collector[1].time
		const percentage = 14

		const min_distance = (x + y) / 2 - (percentage * x + percentage * y) / 200
		const max_distance = (x + y) / 2 + (percentage * x + percentage * y) / 200
		const distance_diff = max_distance - min_distance

		const isDetect = min_distance < x && x < max_distance

		if (isDetect) {
			return this.caculate_spam_score(x, y, distance_diff)
		} else {
			return -1
		}
	}

	private caculate_spam_score(x: number, y: number, distance_diff: number) {
		let temp: number;

		if (x < y) {
			temp = x;
			x = y
			y = temp;
		}

		const diff = x - y;

		return (1 - (diff / distance_diff)) * 100
	}
}
