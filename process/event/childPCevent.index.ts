import cluster from "cluster";
import { Collection } from "discord.js";
import { client, debugging, ROLE } from "../..";
import { ProcessMessage, WorkerAction } from "../../type/type.versionManager";

if(cluster.isWorker) {
	process.on("message", ((message: string) => {
		const _m: ProcessMessage<"role"> | ProcessMessage<"cluster"> = JSON.parse(message)
		if(_m.type == "role") {
			
			if(_m.role == "music") {
				client.music = new Collection();
			}
			ROLE.push(_m.role as string)
			ROLE.push(_m.isSlash as boolean)
		}

		if (_m.type == "cluster") {
			if(_m.message == WorkerAction.shutdown) {
				setInterval(() => {
				if(!process.send) process.exit();
				Array.from(client.music.entries()).forEach((server) => {
					if(server[1].queue.size == 0) {
						client.music.delete(server[0])
					}
				})

				if(client.music.size == 0) {
					if (process.send) {
						return process.send(JSON.stringify({
							type: "worker",
							versionType: ROLE[0],
							processId: process.pid,
							message: WorkerAction.shutdown,
						} as ProcessMessage<"worker">))
					}
				} else {
					return process.send(JSON.stringify({
						type: "worker",
						message: "sendCollection",
						versionType: _m.versionType,
						collection: JSON.stringify(Array.from(client.music.keys())),
						processId: process.pid
					} as ProcessMessage<"worker">))
				}

			}, 1000 * 10)
			}
			if(_m.message == WorkerAction.passPreviousVersionUserList) {
				debugging(JSON.stringify({
					message: "WorkerAction.passPreviousVersionUserList",
					func: "process.on",
					collection: _m.collection
				}))
				if(_m.collection) {
					client.previous_version_guilds = new Set(JSON.parse(_m.collection))
				}
			}
		}
	}))
}