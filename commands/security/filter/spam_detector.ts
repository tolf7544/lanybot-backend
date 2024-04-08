import MessageFreqFilter from "./FreqFilter"
import MessageURLFilter from "./UrlFilter"


export default class SpamDetector {
	private dfsps = 1.5 //detect freq spam per second
	private dfsl = 2 // detect freq spam limit
	private scp = 14 // spam check percentage


	private dssps = 5 //detect sim spam per second
	private dssl = 90// detect sim spam limit

	//mutli_detect_freq_spam_per_sec: MessageFilter = new MessageFilter(this.dsps, this.dsl)
	//mutli_detect_freq_spam_per_min: MessageFilter = new MessageFilter(this.dspm, this.dsl)
	
	//mutli_detect_mean_spam_per_sec: MessageFilter = new MessageFilter(this.dsps, this.dsl, "char")
	//mutli_detect_mean_spam_per_min: MessageFilter = new MessageFilter(this.dspm, this.dsl, "char")

	private single_detect_freq_spam_per_sec: Map<string/** user id */, MessageFreqFilter> = new Map() 
	
	private single_detect_mean_spam_per_sec: Map<string/** user id */, MessageFreqFilter> = new Map()

	private single_detect_spam_url: Map<string/** user id */, MessageURLFilter> = new Map()

	constructor(_dfsps?:number, _dfsl?:number,_dssps?:number, _dssl?:number) {
		if(_dfsps) {this.dfsps = _dfsps}
		if(_dfsl) {this.dfsl = _dfsl}
		if(_dssps) {this.dssps = _dssps}
		if(_dssl) {this.dssl = _dssl}

	}

	// add_message_global(message:string) {
	// 	/** freq */
	// 	this.mutli_detect_freq_spam_per_sec.add_message(message);
	// 	this.mutli_detect_freq_spam_per_min.add_message(message);

	// 	/** mean */
	// 	this.mutli_detect_mean_spam_per_sec.add_message(message);
	// 	this.mutli_detect_mean_spam_per_min.add_message(message);
	// }

	add_message_single(userId:string, message: string) {
		if(!this.single_detect_freq_spam_per_sec.has(userId)) {
			this.single_detect_freq_spam_per_sec.set(
				userId,
				new MessageFreqFilter(this.dfsps,this.dfsl, this.scp)
			)
		}

		if(!this.single_detect_spam_url.has(userId)) {
			this.single_detect_spam_url.set(
				userId,
				new MessageURLFilter()
			)
		}

		// if(!this.single_detect_mean_spam_per_sec.has(userId)) {
		// 	this.single_detect_mean_spam_per_sec.set(
		// 		userId,
		// 		new MessageFreqFilter(this.dfsps,this.dfsl)
		// 	)
		// }

		(this.single_detect_freq_spam_per_sec.get(userId) as MessageFreqFilter)
		.added_message().then((score) => {
			
		});

		const url = message.match(/(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?\/[a-zA-Z0-9]{2,}|((https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?)|(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}(\.[a-zA-Z0-9]{2,})?/g);
		if(url) {
			(this.single_detect_spam_url.get(userId) as MessageURLFilter)
			.checkURL(url[0]).then((result) => {
				if(result == true) {
					/**
					 * 
					 * malware 탐지
					 * 
					 */
				}
			})
		}

	}
}