import cluster, { Worker } from "cluster"
import { client, debugging } from "../.."
import { WorkerAction, CommandType, ProcessMessage } from "../../type/type.versionManager"
import { MusicVersionName, SecurityVersionName, SlashCommandVersionName, Version, VersionName } from "../../type/type.index"
import path from "path"
import fs from 'fs';

export function workerPCevent(worker:Worker) {
if (cluster.isPrimary) {
	worker.on("message", ((message: string) => {

		const _m: ProcessMessage<"worker" | "music"> = JSON.parse(message)
		const pid = Array.from(client.process.entries()).filter((_v) => { return _v[1].worker.process.pid == _m.processId })
		const keys = getVersionKey(_m.process.versionType);
		if(pid.length != 0) {
			if(_m.message) {
				if (_m.message == WorkerAction.shutdown) {
					const _w = client.process.get(pid[0][0])?.worker
					if(_w) {
						_w.kill();
					}
					
					if(keys?.length == 1) {
						generateProcess(_m.process.versionType, _m.collection);
					} else {
						if(keys) {
							const key = keys[1];
							if(client.process.get(key)?.worker.isConnected()) {
								client.process.get(key)?.worker.send(JSON.stringify({
									process: {
										type: "cluster",	
										versionType: _m.process.versionType
									},
	
									message: WorkerAction.passPreviousVersionUserList,
									collection:JSON.stringify([]) as string,
									processId: worker.process.pid,
								} as ProcessMessage<"cluster">))
							}
						}
					}

					return client.process.delete(pid[0][0])
				}
			} else if(_m.process.type == "music") {
				const pc = client.process.get(keys?.pop() as string);
				console.log(_m)
				pc?.worker.send(message)
			}

		}


		if (_m.message == WorkerAction.sendCollection) {
			if(keys?.length == 1) {
				generateProcess(_m.process.versionType, _m.collection);
			} else {
				if(keys) {
					const key = keys[1];
					client.process.get(key)?.worker.send(JSON.stringify({
						process: {
							type: "cluster",	
							versionType: _m.process.versionType
						},
						message: WorkerAction.passPreviousVersionUserList,
						collection:_m.collection,
						processId: worker.process.pid,
					} as ProcessMessage<"cluster">))
				}
			}
		}

	}))
}
}

export function getVersionKey(name: VersionName): string[] | undefined {
	const temp = (Array.from(client.process.entries()).filter((v) => { return v[0].split("-")[0] == name; }))
	if (!temp[temp.length - 1]) {
		return undefined
	} else {
		if (temp.length > 1) {
			return [
				temp[temp.length - 2][0] as unknown as string,
				temp[temp.length - 1][0] as unknown as string
			]
		} else {
			return [
				temp[temp.length - 1][0] as unknown as string
			]
		}
	}
}
export function getVersionName(name: string): string[] | undefined {
	const temp = (Array.from(client.process.entries()).filter((v) => { return v[0] == name; }))
	if (!temp[temp.length - 1]) {
		return undefined
	} else {
		if (temp.length > 1) {
			return [
				temp[temp.length - 2][0].split("-")[0] as unknown as string,
				temp[temp.length - 1][0].split("-")[0] as unknown as string
			]
		} else {
			return [
				temp[temp.length - 1][0].split("-")[0] as unknown as string
			]
		}
	}
}

export function getVersionNum(name: VersionName): string[] | undefined {
	const temp = (Array.from(client.process.entries()).filter((v) => { return v[0].split("-")[0] == name; }))
	if (!temp[temp.length - 1]) {
		return undefined
	} else {
		if (temp.length > 1) {
			return [
				temp[temp.length - 2][0].split("-")[1] as unknown as string,
				temp[temp.length - 1][0].split("-")[1] as unknown as string
			]
		} else {
			return [
				temp[temp.length - 1][0].split("-")[1] as unknown as string
			]
		}
	}
}

function version(): Version | undefined {
	try {
		const version = fs.readFileSync("./config/versions.json", { encoding: "utf-8" })
		return JSON.parse(version);
	} catch (error) {
		return undefined
	}
}

export function generateProcess(name: VersionName, guilds_list?: string, callback?: CallableFunction) {
	debugging({
		message: "start generating process",
		func: "generateProcess"
	})
	if(!name) return;
	const foldersPath = path.join(__dirname, 'commands/');
	const _v = version()
	let commandType: CommandType | keyof typeof MusicVersionName
	if (name in SecurityVersionName) {
		commandType = CommandType.security
	} else if(name in MusicVersionName){
		commandType = name as MusicVersionName
	} else {
		commandType = CommandType.client
	}
	// eslint-disable-next-line no-prototype-builtins

	if (!_v) {
		debugging({
			message: "version is not found\nretry in...5sec",
			func: "generateProcess"
		})
		return setTimeout(() => {
			debugging({
				message: "retrying generateProcess",
				func: "generateProcess"
			})
			generateProcess(name)
		}, 5000);
	}

	const worker = cluster.fork();
	debugging({
		message: "generated process",
		func: "generateProcess"
	})

	client.process.set(
		`${name}-${(_v)[name]}`,
		{
			state: "active",
			worker: worker,
			path: foldersPath + commandType + "/" + name + ".js",
		}
	)
	
	workerPCevent(worker);

		// eslint-disable-next-line no-prototype-builtins
		const isSlash = SlashCommandVersionName.hasOwnProperty(name)
		worker.send(JSON.stringify({
			process: {
				type: "role",
				versionType: name,
			},
			role: commandType,
			isSlash: isSlash,
			processId: worker.process.pid
		} as ProcessMessage<"role">))

		worker.send(JSON.stringify({
			process: {
				type: "cluster",
				versionType: name
			},
			message: WorkerAction.passPreviousVersionUserList,
			collection:guilds_list,
			processId: worker.process.pid,
		} as ProcessMessage<"cluster">))

		if(callback) {
			callback()
		}
		
		debugging({
			message: "wroker online",
			name: name,
			func: "worker.once"
		})
}