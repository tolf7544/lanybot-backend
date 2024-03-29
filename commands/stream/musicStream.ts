import { client } from "../..";
import { musicIPCdataFormat } from "../../type/type.IPCdata";
import { Stream } from "./stream";
import { AudioPlayerStatus, VoiceConnectionStatus } from "@discordjs/voice";
import { sendPCMessage } from "./usePC";
import { MusicWorkerType } from "../../type/type.versionManager";

export function executeStream(data: string | undefined) {
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

export function clearStream(data: string | undefined) {
	const result = useStream(data);
	if(!result) return;
	const stream = result;

	if(stream.youtubeId) {
		try{
			stream.player.stop(true);
		}catch(e) {/** empty */	}
		if(stream.connection?.state) {
			if(stream.connection.state.status != VoiceConnectionStatus.Destroyed) {
				try {
					if (stream.communityServer?.guild.members.me) {
						if(stream.connection.state.status != VoiceConnectionStatus.Disconnected) {
							stream.communityServer.guild.members.me.voice.disconnect();
						}
					}
					stream.connection.destroy();
				} catch (error) { /* empty */ }
			}
		} else {
			try {
				if (stream.communityServer?.guild.members.me) {
						stream.communityServer.guild.members.me.voice.disconnect();
				}
			} catch (e) {/** empty */}
		}

	}

	if(stream.communityServer?.guild.id) {
		if (client.streamQueue.has(stream.communityServer.guild.id)) {
			client.streamQueue.delete(stream.communityServer.guild.id);
		}
	}

	sendPCMessage(MusicWorkerType.music,"executeStream", "finished",undefined, {guildId:stream.communityServer?.guild.id as string})
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
		sendPCMessage(MusicWorkerType.music,"skipStream", "pass","MusicIsIdle", {guildId:stream.communityServer?.guild.id as string})
	} else {
		stream.player.stop();
		/**
		 * 
		 * return music skipped
		 * 
		 */
		sendPCMessage(MusicWorkerType.music,"skipStream", "success", undefined, {guildId:stream.communityServer?.guild.id as string})
	}
}

export function pauseStream(data: string | undefined) {
	const result = useStream(data);
	if(!result) return;
	const stream = result;

	if(stream.player?.state) {
		if(stream.player.state.status == AudioPlayerStatus.Playing) {
			stream.player.pause();
		} else if(stream.player.state.status == AudioPlayerStatus.Paused) {
			sendPCMessage(MusicWorkerType.music,"pauseStream", "failed", "AlreadyPaused", {guildId:stream.communityServer?.guild.id as string})
		} else {
			sendPCMessage(MusicWorkerType.music,"pauseStream", "failed", "ReadyForStream", {guildId:stream.communityServer?.guild.id as string})
		}
	} else {
		sendPCMessage(MusicWorkerType.music,"pauseStream", "failed", "UndefinedPlayerState", {guildId:stream.communityServer?.guild.id as string})
	}
}

export function unpauseStream(data: string | undefined) {
	const result = useStream(data);
	if(!result) return;
	const stream = result;

	if(stream.player?.state) {
		if(stream.player.state.status == AudioPlayerStatus.Paused) {
			stream.player.unpause();
		} else if(stream.player.state.status == AudioPlayerStatus.Playing) {
			sendPCMessage(MusicWorkerType.music,"resumeStream", "failed", "AlreadyPlaying", {guildId:stream.communityServer?.guild.id as string})
		} else {
			sendPCMessage(MusicWorkerType.music,"resumeStream", "failed", "ReadyForStream", {guildId:stream.communityServer?.guild.id as string})
		}
	} else {
		sendPCMessage(MusicWorkerType.music,"resumeStream", "failed", "UndefinedPlayerState", {guildId:stream.communityServer?.guild.id as string})
	}
}


export function useStream(musicIPCdataString: string | undefined) {
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

	stream = client.streamQueue.get(musicIPCdata.guildId) as Stream;
	stream.youtubeId = musicIPCdata.youtubeId
	
	return stream;
}