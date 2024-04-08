import cluster from "cluster";
import { client, debugging, ROLE } from "../..";
import { ProcessMessage, WorkerAction } from "../../type/type.versionManager";


export function childPCevent_security() {
	if (cluster.isWorker) {
		process.on("message", ((message: string) => {
			const _m: ProcessMessage<"cluster"> | ProcessMessage<"music"> = JSON.parse(message)

			if (_m.process.type == "cluster") {
				if (_m.message == WorkerAction.shutdown) {
					client.is_shutdown = true;

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
		}))
	}
}