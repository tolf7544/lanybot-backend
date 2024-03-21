// import cluster from "cluster";
// import { client, debugging, ROLE } from "../..";
// import { ProcessMessage, WorkerAction } from "../../type/type.versionManager";

// if(cluster.isWorker) {
// 	process.on("message", ((message: string) => {
// 		const _m: ProcessMessage<"cluster"> | ProcessMessage<"worker"> = JSON.parse(message)
		
// 		if (_m.type == "cluster") {
// 			if(_m.message == WorkerAction.shutdown) {
// 				client.is_shutdown = true;
				
// 				setInterval(() => {
// 				if(!process.send) process.exit();
// 				Array.from(client.music.entries()).forEach((server) => {
// 					if(server[1].queue.size == 0) {
// 						client.music.delete(server[0])
// 					}
// 				})

// 				if(client.music.size == 0) {
// 					if (process.send) {
// 						return process.send(JSON.stringify({
// 							type: "worker",
// 							versionType: ROLE[0],
// 							processId: process.pid,
// 							message: WorkerAction.shutdown,
// 						}as ProcessMessage<"worker">))
// 					}
// 				} else {
// 					return process.send(JSON.stringify({
// 						type: "worker",
// 						message: "sendCollection",
// 						versionType: _m.versionType,
// 						collection: JSON.stringify(Array.from(client.music.keys())),
// 						processId: process.pid
// 					}as ProcessMessage<"worker">))
// 				}

// 			}, 1000 * 10)
// 			}
// 			if(_m.message == WorkerAction.passPreviousVersionUserList) {
// 				debugging(JSON.stringify({
// 					message: "WorkerAction.passPreviousVersionUserList",
// 					func: "process.on",
// 					collection: _m.collection
// 				}))
// 				if(_m.collection) {
// 					client.previous_version_guilds = new Set(JSON.parse(_m.collection))

// 					console.log(client.previous_version_guilds)
// 				}
// 			}
// 		} else if(_m.type == "worker") {
// 			if(process.send){
// 				process.send(JSON.stringify({
// 					type: "worker",
// 					message: _m.message,
// 					versionType: _m.versionType,
// 					data: _m.data,
// 					processId: process.pid
// 			}))
// 			}
// 	}
// 	}))
// }