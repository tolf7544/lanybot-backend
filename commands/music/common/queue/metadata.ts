import { serverLogger } from "../../../../logManager";
import { video, recommendVideos } from "../../../../type/type.metadata";
import { Common, Streaming } from "../../../../type/type.error";
import { getMusicData } from "../yt_video/getMusicData";
import { CommunityServer } from "../../../../type/type.common";

export class Metadata {
	Category: string;
	MusicData: video;
	RecommendVideos: Map<number, recommendVideos>;
	id: string;
	logger = new serverLogger()
	constructor(_id:string) {
		this.id = _id;
		this.MusicData = {
			title: 'undefined',
			time: 'undefined',
			timeS: 0,
			keywords: 'undefined',
			description: 'undefined',
			thumbnail: 'undefined',
			channelUrl: 'undefined',
			channelName: 'undefined',
			channelThumbnail: 'undefined',
			officialChannel: 'undefined',
		}
	}


	async setMusic(server:CommunityServer): Promise<string|void> {

		const video = await getMusicData("https://youtu.be/" + this.id, server, null)
		
		if(video.error != null) {
			if(video.error == "ADULT") return Streaming.adult_contents;
			this.errorLogger(server,video)
			return Common.library_issue
		} else {
			this.MusicData = video.videoData
			this.Category = video.category
			this.RecommendVideos = video.recommendVideoData
		}
	}

	get recommendVideos():Map<number,recommendVideos> {
		return this.RecommendVideos
	}

	get videoId():string {
		return this.id
	}

	get url():string {
		return ('https://youtu.be/' + this.id)
	}


	private errorLogger(server:CommunityServer,video:any) {
		this.logger.writeLog({
			isCommand:true,
			isError:true,
			location: {
				dir: __dirname,
				file: __filename,
				func: "setMusic"
			},
			guildData: {
				guild: {id: server.guild.id},
				user: {id: server.member.user.id}
			},
			error:video.error,
			message: "getMusicData response error",
			service: {
				serviceType: "music",
				Trigger: "CommandEvent",
				action: {
					name: "get_youtube_data",
					status: "end",
				},
				active_loop: "system_active",
			},

			cmd: {
				name:"play",
				status: "running"
			}
		})
	}
}