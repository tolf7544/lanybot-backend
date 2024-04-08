import cluster from "cluster";
import { client, debugging, ROLE } from "../..";
import { ProcessMessage, WorkerAction } from "../../type/type.versionManager";
import { clearStream, executeStream, getPlaybackDuration, moveNextStream, movePreStream, pauseStream, skipStream, unpauseStream } from "../../commands/stream/musicStream";
import { MusicWorkerAction } from "../../type/type.stream";


export function childPCevent_stream() {
	if (cluster.isWorker) {
		process.on("message", ((message: string) => {
			const _m: ProcessMessage<"cluster"> | ProcessMessage<"music"> = JSON.parse(message)
			if (_m.message) {
				if (_m.process.type == "cluster") {

					if (_m.message == WorkerAction.shutdown) {
						client.is_shutdown = true;

						setInterval(() => {
							if (!process.send) process.exit();

							if (client.streamQueue.size == 0) {
								if (process.send) {
									return process.send(JSON.stringify({
										process: {
											type: "worker",
											versionType: ROLE[0],
										},
										processId: process.pid,
										message: WorkerAction.shutdown,
									} as ProcessMessage<"worker">))
								}
							} else {
								Array.from(client.streamQueue.entries()).forEach((entry) => {
									if(entry[1].communityServer == undefined) {
										client.streamQueue.delete(entry[0])
									}

									if(entry[1].player) {
										if(entry[1].player?.state) {
											// pass
										} else {
											client.streamQueue.delete(entry[0])
										}
									}
									if(entry[1].connection) {
										if(entry[1].connection?.state) {
											// pass
										} else {
											client.streamQueue.delete(entry[0])
										}
									}
								})

								return process.send(JSON.stringify({
									process: {
										type: "worker",
										versionType: _m.process.versionType,
									},
									message: "sendCollection",
									collection: JSON.stringify(Array.from(client.streamQueue.keys())),
									processId: process.pid
								} as ProcessMessage<"worker">))
							}

						}, 1000 * 10)
					}


					if (_m.message == WorkerAction.passPreviousVersionUserList) {
						debugging(JSON.stringify({
							message: "WorkerAction.passPreviousVersionUserList",
							func: "process.on",
							collection: _m.collection
						}))
						if (_m.collection) {
							client.previous_version_guilds = new Set(JSON.parse(_m.collection))

						}
					}
				}
			} else {
				if (_m.process.type == "music") {
					if (_m.process.music.action == MusicWorkerAction.executeStream) {
						return executeStream(_m.data,_m.processId);
					} else if(_m.process.music.action == MusicWorkerAction.skipStream) {
						return skipStream(_m.data);
					} else if(_m.process.music.action == MusicWorkerAction.clearStream) {
						return clearStream(_m.data);
					} else if(_m.process.music.action == MusicWorkerAction.pauseStream) {
						return pauseStream(_m.data);
					} else if(_m.process.music.action == MusicWorkerAction.resumeStream) {
						return unpauseStream(_m.data);
					} else if(_m.process.music.action == MusicWorkerAction.movePreStream) {
						return movePreStream(_m.data);
					} else if(_m.process.music.action == MusicWorkerAction.moveNextStream) {
						return moveNextStream(_m.data);
					} else if(_m.process.music.action == MusicWorkerAction.getPlayPlaybackDuration) {
						return getPlaybackDuration(_m.data);
					}
				}
			}
		}))
	}
}