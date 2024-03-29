import { ChatInputCommandInteraction } from "discord.js";
import { PlaylistItem } from "../../../type/type.queue";
import { setTime } from "./yt_video/getMusicData";
import { getPlaylist, videoId } from "./yt_video/streamPlaylistData";
import { Metadata } from "./queue/metadata";
import { useGuild } from "../../../lib/useGuild";
import ytdl from "ytdl-core";
import { CommunityServer } from "../../../type/type.common";
import { DiscordClient,  StreamingQueue, YTCrawler } from "../../../type/type.error";
import { checkPlaylistAdd } from "./playlist/checkAdd";
import { serverLogger } from "../../../logManager";
import { search } from "./search/search";
import { debugging } from "../../..";
import { sendEmbed } from './error/embed';
export class Queue extends Map<number, Metadata> {

	communityServer: CommunityServer | undefined
	logger = new serverLogger()
	activeId: number = 0
	loop: "single"|"all"|"false" = "false"
	action: {
		isSkip: boolean 
		isClear: boolean
		isPreviousStream: boolean
		isPause: boolean
	} = {
		isSkip: false,
		isClear:false,
		isPreviousStream: false,
		isPause: false
	}
	constructor(input: ChatInputCommandInteraction) {
		super();

		this.communityServer = useGuild(input);
	}

	get mapId() {
		const keys = Array.from(this.keys())

		if(keys.length == 0) {
			return 0
		} else {
			return keys.pop() as number +1 
		}
	}

	addPlaylist(playlist: Array<PlaylistItem>) {
		if(!this.communityServer) return;

		for (const _unit of playlist) {
			const music = new Metadata(_unit[0]);
			music.MusicData.title = _unit[1];
			music.MusicData.time = setTime(_unit[2], this.communityServer)
			this.set(this.size,music);
		}
	}

	remove(number?: number):Metadata | undefined | string {
		let temp:Metadata | undefined;

		if (!number) {

			temp = this.get(this.activeId);
			this.delete(this.activeId)
			this.activeId += 1;
			return temp;
		} else {
			if (number > this.size) {
				return StreamingQueue.remove_over_max
			}
			if(0 > number) {
				return StreamingQueue.remove_over_mini
			}

			const key = Array.from(this.keys())[number - 1]
			// eslint-disable-next-line @typescript-eslint/no-unused-vars

			temp = this.get(key);
			this.delete(key)

			return temp;
		}
	}


	active() {
		const _key = Array.from(this.keys()).filter((_v) => { return _v == this.activeId})
		const temp = this.get(_key[0])

		return temp;
	}

	activePosition() {
		return Array.from(this.keys()).indexOf(this.activeId)
	}

	setLoop(option:"single"|"all"|"false") {
		this.loop = option
	}

	next() {
		if(this.loop == "single") {
			/** pass */
		} else if(this.loop == "all") {
			if(this.activePosition()+1 == this.size) {
				this.activeId = Array.from(this.keys()).shift() as number;
			}
		}

		const _key = Array.from(this.keys())[this.activePosition() + 1]
		this.activeId = _key;
		const temp = this.get(_key)

		return temp;
	}

	previous() {
		this.activeId -= 1
		const _key = Array.from(this.keys())[this.activeId]
		const temp = this.get(_key)

		return temp;
	}

	add(query: string, isNext: boolean, server: CommunityServer, callback: CallableFunction): void {
			this.search_query(query, server).then((ids) => {
				debugging(JSON.stringify({
					ids: ids
				}))

				if (typeof ids == "string") {
					sendEmbed(server, ids);
				} else {
					if (ids.length > 0) {
						let id: videoId = ""
						id = ids[0][0];
						const music = new Metadata(id)
						music.setMusic(server).then((result: string | void) => {
							if (typeof result == "string") {
								sendEmbed(server, result)
							} else {
								if (isNext == true) {

									Array.from(this.entries()).filter((v) => { return v[0] > this.activeId }).forEach((_e) => {
										this.set(_e[0] + 1, _e[1])
									})
									this.set(this.activeId + 1, music)
								} else {
									this.set(this.mapId, music)
								}
							}

							if (ids.length > 1) {
								ids.shift();
								for (const video of ids) {
									const music = new Metadata(video[0])
									music.MusicData.title = video[1]
									music.MusicData.time = video[2]
									if (isNext == true) {
										const temp = this.get(Array.from(this.keys())[this.size - 1]) as Metadata
										Array.from(this.entries()).forEach((_e) => {
											this.set(_e[0] + 1, _e[1])
										})
										this.set(this.mapId, temp)
									} else {
										this.set(this.mapId, music)
									}
								}
							}

							callback(music);
						})
					} else {
						/**
						 * 
						 * 오류 
						 * 
						 * 재생 목록 존재 x
						 */
					}
				}
			}).catch((reason: string) => {
				sendEmbed(server, reason)
			})

	}
	
	search_query(query: string, server: CommunityServer) {
		return new Promise((resolve:((success:PlaylistItem[]) => void),reject:((success:string | null) => void)) => {

		
		let id: string | null = null;
		try { id = ytdl.getURLVideoID(query) } catch (error) { /** empty */ }
		// eslint-disable-next-line no-useless-escape
		const pl_id = query.match(/[?&]list=([^#\&\?]+)/g)

		let ids: PlaylistItem[] = []
		if (!this.communityServer) {
			return reject(DiscordClient.failed_get_client)
		}

		if (id) {
			/** id 기반 재생 */
			if (pl_id) {
				getPlaylist(pl_id[0]).catch((res) => {
					this.logger.writeLog(res[0]);
				}).then((playlist) => {

				if (playlist == undefined) {
					return reject(YTCrawler.playlist_is_undefined)
				}
				if (playlist.length == 0) {
					return reject(YTCrawler.playlist_zero_size)
				}

				checkPlaylistAdd(playlist, server).catch((reason) => {
					this.logger.writeLog(reason[0]);
					return reject(reason[1])
				}).then((result) => {
					if(typeof result == "object") {
						if (result.data == true) ids = ids.concat(playlist);
						else ids.push(playlist[0])
					} else {
						return reject(null);
					}
				})
				})
			}

			if (id && typeof id == 'string') {
				ids.unshift([id, "undefined", "undefined"])
			}

			resolve(ids);
		} else {
			/** 검색 필요 */
			search(this.communityServer,query).then((result) => {
				ids.push([result[0], "undefined", "undefined"])
				resolve(ids)
		}).catch((reason) => {
			reject(reason);
		})
		}
	})
	}
	
}