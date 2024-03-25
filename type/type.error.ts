
export enum GoogleAPI {
	Success = 200,
	BadRequest = 400,
	Forbidden = 403,
	ResourceExhausted = 429,
	InternalServerError = 500,
	ServiceUnavailable = 503,
	GatewayTimeout = 504,
}
// 0 - 100
export enum YTCrawler {
	playlist_is_undefined = "_0001",
	playlist_zero_size = "_0002",
	
}

// 100 - 200
export enum DiscordMessage {
	send_message_failed = "_0101",
	failed_get_from_message_collector = "_0102"
}

// 200 - 300
export enum Common {
	try_catch = "_0201",
	api_issue = "_0202",
	library_issue= "_0203"
}

// 300 - 400
export enum DiscordClient {
	failed_get_client = "_0301",
	failed_get_voice_channel = "_0302",
	not_connected_voice_channel = "_0303",
	failed_join_voice_channel = "_0304",
	failed_join_voice_channel2 = "_0305",
}

// 400 - 500 
export enum Streaming {
	empty_queue = "_0401",
	empty_voice_info = "_0402",
	controling_on_empty_queue = "_0404",
	fast_command_use = "_0405",
	adult_contents = "_0406",
	failed_get_readable_stream_data = "_0407",
	fast_skip_request = "_0408"
}

// 500 - 600
export enum StreamingQueue {
	remove_over_max = "_0501",
	remove_over_mini = "_0502",
	unknown_queue = "_0503"
}

export const ErrorCode = [
	...Object.values(Streaming),
	...Object.values(YTCrawler),
	...Object.values(DiscordMessage),
	...Object.values(Common),
	...Object.values(DiscordClient),
]