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

export class Queue extends Map<number, Metadata> {

	communityServer: CommunityServer | undefined
	logger = new serverLogger()
	activeId: number = 0
	loop: "single"|"all"|"false"
	constructor(input: ChatInputCommandInteraction) {
		super();

		this.communityServer = useGuild(input);
	}

	get mapId() {
		const keys = Array.from(this.keys())

		if(keys.length == 0) {
			return 0
		} else {
			return keys.pop() as number
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
			if(this.activeId != 0) {
				this.activeId -= 1
			}

			temp = this.get(this.activeId);
			this.delete(this.activeId)
			return temp;
		} else {
			if (number > this.size) {
				return StreamingQueue.remove_over_max
			}
			if(0 > number) {
				return StreamingQueue.remove_over_mini
			}

			if (number < this.activeId) {
				this.activeId -= 1;
			}
			const key = Array.from(this.keys())[number - 1]
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			temp = this.get(key);
			this.delete(key)
			return temp;
		}
	}

	active() {
		const _key = Array.from(this.keys())[this.activeId]
		const temp = this.get(_key)

		return temp;
	}

	setLoop(option:"single"|"all"|"false") {
		this.loop = option
	}

	next() {
		if(this.loop == "single") {
			/** pass */
		} else if(this.loop == "all") {
			if(this.activeId+1 > this.size) {
				this.activeId = 0;
			} else {
				this.activeId += 1
			}
		} else {
			this.activeId += 1
		}

		const _key = Array.from(this.keys())[this.activeId]
		const temp = this.get(_key)

		return temp;
	}

	previous() {
		this.activeId -= 1
		const _key = Array.from(this.keys())[this.activeId]
		const temp = this.get(_key)

		return temp;
	}

	add(query: string, isNext: boolean): string | boolean | undefined {
			if(!this.communityServer) return false; 
			this.search_query(query).then((id_list) => {
				if (typeof id_list == 'undefined') return false;
				if (typeof id_list == "string") {
					return id_list;
				} else {
					if (id_list.length > 0) {
						let id: videoId = ""
						if (typeof id_list[0][0] == "string") {
							id = id_list[0][0];
						} else {
							return true
						}
						const music = new Metadata(id)
						music.setMusic(this.communityServer as CommunityServer).then(() => {
							if (isNext == true) {
							
								Array.from(this.entries()).filter((v) => {return v[0] > this.activeId}).forEach((_e) => {
									this.set(_e[0]+1,_e[1])
								})
								this.set(this.activeId+1,music)
							} else {
								this.set(this.mapId,music)
							}
						})
						return true
					}
					
					if (id_list.length > 1) {
						id_list.shift();
						for (const video of id_list) {
							const music = new Metadata(video[0])
							music.MusicData.title = video[1]
							music.MusicData.time = video[2]
							if (isNext == true) {
								const temp = this.get(Array.from(this.keys())[this.size - 1]) as Metadata 
								Array.from(this.entries()).forEach((_e) => {
									this.set(_e[0]+1,_e[1])
								})
								this.set(this.mapId,temp)
							} else {
								this.set(this.mapId,music)
							}
						}
					}

					return true
				}	
			});

		}
	
	async search_query(input_query: string) {
	
		let id: string | null = null;
		try { id = ytdl.getURLVideoID(input_query) } catch (error) { /** empty */ }
		// eslint-disable-next-line no-useless-escape
		const pl_id = input_query.match(/[?&]list=([^#\&\?]+)/g)

		let id_list: PlaylistItem[] = []
		if (!this.communityServer) return DiscordClient.failed_get_client

		if (id) {
			/** id 기반 재생 */
			if (pl_id) {
				const playlist_list: PlaylistItem[] = await getPlaylist(pl_id[0]);
				console.log(playlist_list)
				if (playlist_list == undefined) return YTCrawler.playlist_is_undefined
				if (playlist_list.length == 0) return YTCrawler.playlist_zero_size

				const result = await checkPlaylistAdd(playlist_list, this.communityServer).catch((res) => {
					this.logger.writeLog(res[0]);
					return res[1]
				});
				if (result == true) id_list = id_list.concat(playlist_list);
				else id_list.push(playlist_list[0])
			}

			if (id && typeof id == 'string') {
				id_list.unshift([id, "undefined", "undefined"])
			}

			return id_list;
		} else {
			/** 검색 필요 */
			const res = await search(this.communityServer,input_query)
			if (typeof res == "object") {
				id_list.push([res[0], "undefined", "undefined"])
				return id_list
			} else {
				return res
			}
		}
	}
}