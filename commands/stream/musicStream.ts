import { client } from "../..";
import { musicIPCdataFormat } from "../../type/type.IPCdata";
import { Stream } from "./stream";
import { AudioPlayerStatus } from "@discordjs/voice";
import { sendPCMessage } from "./usePC";
import { MusicWorkerType } from "../../type/type.versionManager";

export function executeStream(data: string | undefined) {
	console.log(data)
	const result = useStream(data);
	if(!result) return;
	const stream = result;
	
	if(!stream.player || !stream.connection) {
		stream.set_player()
		stream.set_connection()
		return stream.streaming();	

	} else {
		if(stream.player.state.status == AudioPlayerStatus.Idle) {
			/**
			 * 
			 * return stream
			 * 
			 */
			return stream.streaming();
		} else {
		/**
		 * 
		 * return music is playing
		 * 
		 */
		sendPCMessage(MusicWorkerType.music,"executeStream", "failed", "MusicIsPlaying", {guildId:stream.communityServer?.guild.id as string})
		}

	}
}

export function skipStream(data: string | undefined) {
	const result = useStream(data);
	if(!result) return;
	const stream = result;

	if(stream.player.state.status == AudioPlayerStatus.Buffering) {
		/**
		 * 
		 * return early skipping
		 * 
		 */
		sendPCMessage(MusicWorkerType.music,"skipStream", "failed","EarlySkipping", {guildId:stream.communityServer?.guild.id as string})
	} else if (stream.player.state.status == AudioPlayerStatus.Idle) {
		/**
		 * 
		 * return skipped
		 * 
		 */
		sendPCMessage(MusicWorkerType.music,"skipStream", "pass","MusicIsIdle")
	} else {
		stream.player.stop();
		/**
		 * 
		 * return music skipped
		 * 
		 */
		sendPCMessage(MusicWorkerType.music,"skipStream", "success")
	}
}


function useStream(musicIPCdataString: string | undefined) {
	if (!musicIPCdataString) { return }
	const musicIPCdata:musicIPCdataFormat = JSON.parse(musicIPCdataString);
	let stream: Stream;
	if (client.streamQueue.has(musicIPCdata.guildId)) {
		stream = client.streamQueue.get(musicIPCdata.guildId) as Stream;
	} else {
		stream = new Stream({
			guildId: musicIPCdata.guildId,
			memberId: musicIPCdata.memberId,
			channelId: musicIPCdata.channelId,
			type: "interaction"
		}, musicIPCdata.youtubeId)

		client.streamQueue.set(musicIPCdata.guildId,stream);
	}

	return client.streamQueue.get(musicIPCdata.guildId) as Stream;
}