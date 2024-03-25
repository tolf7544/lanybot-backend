export enum MusicWorkerAction {
	executeStream = "executeStream",
	skipStream = "skipStream",
	pauseStream = "pauseStream",
	resumeStream = "resumeStream",
	moveNextStream = "moveNextStream",
	movePreStream = "movePreStream",
	clearStream = "clearStream",
}

export enum ActionStatus {
	start = "start",
	success = "success",
	finished = "finished",
	failed = "failed",
	pass = "pass",
	error = "error" 
}

export enum FailedReason {
	MusicIsPlaying = "MusicIsPlaying",
	EarlySkipping = "EarlySkipping",
	MusicIsIdle = "MusicIsIdle",
	FailedConnectChannel = "FailedConnectChannel",
	FailedGetReadableStream = "FailedGetReadableStream"
}
