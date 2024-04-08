import cluster from "cluster";
import { client, debugging, ROLE } from "../..";
import { ProcessMessage, WorkerAction } from "../../type/type.versionManager";
import { MusicWorkerAction } from "../../type/type.stream";
import { receiveIPCnextStream, receiveIPCpreStream, receiveIPCskipStream, receiveIPexecuteStream, receivePlaybackDurationData } from "../../commands/music/common/useStreamPC";


export function childPCevent_music() {
	if (cluster.isWorker) {
		process.on("message", ((message: string) => {
			const _m: ProcessMessage<"cluster"> | ProcessMessage<"music"> = JSON.parse(message)

			if (_m.process.type == "cluster") {
				if (_m.message == WorkerAction.shutdown) {
					client.is_shutdown = true;

					setInterval(() => {
						if (!process.send) process.exit();
						Array.from(client.music.entries()).forEach((server) => {
							if (server[1].queue.size == 0) {
								client.music.delete(server[0])
							}
						})

						if (client.music.size == 0) {
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
							return process.send(JSON.stringify({
								process: {
									type: "worker",
									versionType: _m.process.versionType,
								},
								message: "sendCollection",
								collection: JSON.stringify(Array.from(client.music.keys())),
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
			} else if (_m.process.type == "music") {
				if(_m.process.music.action == MusicWorkerAction.executeStream) {
					return receiveIPexecuteStream(_m as ProcessMessage<"music">);
				} else if(_m.process.music.action == MusicWorkerAction.skipStream) {
					return receiveIPCskipStream(_m as ProcessMessage<"music">)
				} else if(_m.process.music.action == MusicWorkerAction.movePreStream) {
					return receiveIPCpreStream(_m as ProcessMessage<"music">)
				} else if(_m.process.music.action == MusicWorkerAction.moveNextStream) {
					return receiveIPCnextStream(_m as ProcessMessage<"music">)
				} else if(_m.process.music.action == MusicWorkerAction.getPlayPlaybackDuration) {
					return receivePlaybackDurationData(_m as ProcessMessage<"music">)
				}
			}
		}))
	}
}