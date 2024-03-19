import fs from 'fs';
import { ProcessCollectorValue, Version, VersionName } from '../type/type.index';
import { Client } from 'discord.js';
import {  ProcessMessage, PublishFiles, WorkerAction } from '../type/type.versionManager';
import { debugging } from '..';
import { generateProcess, getVersionKey, getVersionNum } from './event/masterPCevent.index';

export default class VersionManager {
	client: Client;
	checkVersionTime = 1000 * 5; // 버전 체크 주기 간격


	get version(): Version | undefined {
		try {
			const version = fs.readFileSync("./config/versions.json", { encoding: "utf-8" })
			return JSON.parse(version);
		} catch (error) {
			return undefined
		}
	}
	constructor(_client: Client) {
		this.client = _client;
	}

	VersionUpdator() {
		setInterval(() => {
			this.getFiles().then((generate_targets: PublishFiles[]) => {
				for (const target of generate_targets) {
					if(!target.name) return;
					if (getVersionKey(target.name)) {
						/** client에 올라왔을 때 */
						this.isWorkerLive(target.name).then(() => {
							/** 워커가 살았을때 */
							debugging(JSON.stringify({
								active_version:getVersionNum(target.name)?.pop(),
								new_version: (this.version as Version)[target.name]
							}))
							if (getVersionNum(target.name)?.pop() != (this.version as Version)[target.name]) {
								/** version 업뎃이 필요할 때 002*/
								const new_pc_key = getVersionKey(target.name)?.pop()
								if(!new_pc_key) return this.update(target.name);
								const new_pc = this.client.process.get(new_pc_key)
								if(new_pc?.state == "previous") return;
								return this.update(target.name);
							} else {
								/** pass 001 */
							}
						}).catch(() => {
							/** 죽었을 때 002 */
							debugging(JSON.stringify({
								point: "generate_1",
							}))
							generateProcess(target.name);
						})
					} else {
						/** 생성되지 않았을 때 002 */
						debugging(JSON.stringify({
							point: "generate_2",
						}))
						generateProcess(target.name);
					}
				}
			}).catch(() => {
				/** empty */
			})
		}, this.checkVersionTime);
	}

	useProcess(name: VersionName, guildId: string): Promise<ProcessCollectorValue | undefined> {
		return new Promise((resolve) => {
			this.isWorkerLive(name).then(() => {
				const keys = getVersionKey(name)
				if (keys?.length == 2) {
					const key = keys.filter(() => { return this.client.previous_version_guilds.has(guildId) == true })

					if (key.length > 0) {
						resolve(this.client.process.get(key[0]))
					} else {
						resolve(this.client.process.get(keys.pop() as string))
					}
				} else if (keys?.length == 1) {
					resolve(this.client.process.get(keys.pop() as string))
				}

			}).catch(() => {
				this.getFiles().then((generate_targets: PublishFiles[]) => {
					const target = generate_targets.filter((t) => { return t.name == name })
					generateProcess(target[0].name)
					
				}).catch(() => {
					/** empty */
				})
			})
		})
	}

	getFiles(): Promise<PublishFiles[]> {
		return new Promise((resolve, reject) => {
			debugging({
				message: "get files",
				func: "getFiles"
			})

			if (!this.version) return null;

			const folderName = fs.readdirSync("./commands")
			const publishes: PublishFiles[] = []
			for (const name of folderName) {
				const files = fs.readdirSync("./commands/" + name)
				for (const file of files) {

					if (fs.existsSync("./commands/" + name + "/" + file)) {
						const isPublish = Object.keys(this.version).filter((_d) => { return _d == file.replace(".ts", "") }).length > 0


						if (isPublish) {
							publishes.push({
								url: "./commands/" + name + "/" + file,
								name: file.replace(".ts", "") as VersionName
							})
						}
					}
				}
			}
			if (publishes.length > 0) {
				resolve(publishes)
			} else {
				reject(publishes)
			}

		})
	}

	isWorkerLive(name: VersionName) {
		return new Promise((resolve, reject) => {

			const key = getVersionKey(name)?.pop()

			if (!key) return reject(null)
			if (this.client.process.has(key)) {
				const process = this.client.process.get(key)
				if (process?.worker) {
					if (process.worker.isDead()) {
						reject(null)
					} else {
						resolve(null)
					}
				} else {
					reject(null)
				}
			}
		})

	}

	private update(name: VersionName) {
		debugging({
			message: "wroker update",
			name: name,
			func: "update"
		})

		debugging({
			message: "change worker state [previous]",
			name: name,
			func: "update"
		})
		const _key = getVersionKey(name)


		if (_key) {
			const process = this.client.process.get(_key[0]);
			debugging({
				message: "process.state",
				name: process?.state,
				func: "update"
			})

			if(process && process.state == "active") {
				process.state = "previous"
				this.client.process.set(_key[0],process);

				this.sendMessage2Worker(_key[0], JSON.stringify({
					type: "cluster",
					message: WorkerAction.shutdown,
					processId: process.worker.process.pid,
					versionType: name,
				} as ProcessMessage<"cluster">))
			}
		}
	}

	sendMessage2Worker(_key: string, message: string, run?: CallableFunction) {
		if (this.client.process.has(_key)) {
			const process = this.client.process.get(_key)
			if (process?.worker) {
				if (process.worker.isConnected()) {
					process.worker.send(message);
					if (run) {
						run(process)
					}
				} else {
					this.client.process.delete(_key)
				}
			}
		}
	}
}

