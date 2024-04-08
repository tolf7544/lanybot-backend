export enum MusicWorkerAction {
	executeStream = "executeStream",
	skipStream = "skipStream",
	pauseStream = "pauseStream",
	resumeStream = "resumeStream",
	moveNextStream = "moveNextStream",
	movePreStream = "movePreStream",
	clearStream = "clearStream",
	getPlayPlaybackDuration = "getPlayPlaybackDuration"
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
	MusicIsIdle = "MusicIsIdle",
	FailedConnectChannel = "FailedConnectChannel",
	FailedGetReadableStream = "FailedGetReadableStream",
	VideoUnavailable = "VideoUnavailable",
	FailedPlayStream = "FailedPlayStream",
	UndefinedPlayerState = "UndefinedPlayerState",
	UndefinedConnectionState = "UndefinedConnectionState",
	AlreadyPaused = "AlreadyPaused",
	AlreadyPlaying = "AlreadyPlaying",
	EarlyAction = "EarlyAction",
	ReadyForStream = "ReadyForStream"
}
