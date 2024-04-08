import { client } from "../..";
import { musicIPCdataFormat } from "../../type/type.IPCdata";
import { Stream } from "./stream";
import { AudioPlayerStatus, VoiceConnectionStatus } from "@discordjs/voice";
import { sendPCMessage } from "./usePC";
import { MusicWorkerType } from "../../type/type.versionManager";

export function executeStream(data: string | undefined,pid:number) {
	const result = useStream(data,pid);
	if(!result) return;
	const stream = result;
	
	if(!stream.player?.state || !stream.connection?.state) {
		stream.set_player()
		stream.set_connection()
		return stream.streaming();	

	} else {
		/**
		 * 
		 * return stream
		 * 
		 */

		return stream.streaming();
	}
}

export function clearStream(data: string | undefined) {
	const result = useStream(data);
	if (!result) return;
	const stream = result;

	try {
		stream.player.stop(true);
	} catch (e) {/** empty */ }
	if (stream.connection?.state) {
		if (stream.connection.state.status != VoiceConnectionStatus.Destroyed) {
			try {
				if (stream.communityServer?.guild.members.me) {
					if (stream.connection.state.status != VoiceConnectionStatus.Disconnected) {
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
		} catch (e) {/** empty */ }
	}
	sendPCMessage(MusicWorkerType.music, "executeStream", "finished", stream.musicPid, undefined, { guildId: stream.communityServer?.guild.id as string })

	if (stream.communityServer?.guild.id) {
		if (client.streamQueue.has(stream.communityServer.guild.id)) {
			client.streamQueue.delete(stream.communityServer.guild.id);
		}
	}
}
export function moveNextStream(data: string | undefined) {
	const result = useStream(data);
	if(!result) return;
	const stream = result;
	if(!stream.player?.state) {
		sendPCMessage(MusicWorkerType.music,"moveNextStream", "pass", stream.musicPid,"MusicIsIdle", {guildId:stream.communityServer?.guild.id as string})
	} else if(stream.player.state.status == AudioPlayerStatus.Buffering) {
		/**
		 * 
		 * return early skipping
		 * 
		 */
		sendPCMessage(MusicWorkerType.music,"moveNextStream", "failed", stream.musicPid,"EarlyAction", {guildId:stream.communityServer?.guild.id as string})
	} else if (stream.player.state.status == AudioPlayerStatus.Idle) {
		/**
		 * 
		 * return skipped
		 * 
		 */
		sendPCMessage(MusicWorkerType.music,"moveNextStream", "pass", stream.musicPid,"MusicIsIdle", {guildId:stream.communityServer?.guild.id as string})
	} else {
		stream.player.stop();
		/**
		 * 
		 * return music skipped
		 * 
		 */
		sendPCMessage(MusicWorkerType.music,"moveNextStream", "success", stream.musicPid, undefined, {guildId:stream.communityServer?.guild.id as string})
	}
}
export function movePreStream(data: string | undefined) {
	const result = useStream(data);
	if(!result) return;
	const stream = result;
	if(!stream.player?.state) {
		sendPCMessage(MusicWorkerType.music,"movePreStream", "pass", stream.musicPid,"MusicIsIdle", {guildId:stream.communityServer?.guild.id as string})
	} else if(stream.player.state.status == AudioPlayerStatus.Buffering) {
		/**
		 * 
		 * return early skipping
		 * 
		 */
		sendPCMessage(MusicWorkerType.music,"movePreStream", "failed", stream.musicPid,"EarlyAction", {guildId:stream.communityServer?.guild.id as string})
	} else if (stream.player.state.status == AudioPlayerStatus.Idle) {
		/**
		 * 
		 * return skipped
		 * 
		 */
		sendPCMessage(MusicWorkerType.music,"movePreStream", "pass", stream.musicPid,"MusicIsIdle", {guildId:stream.communityServer?.guild.id as string})
	} else {
		stream.player.stop();
		/**
		 * 
		 * return music skipped
		 * 
		 */
		sendPCMessage(MusicWorkerType.music,"movePreStream", "success", stream.musicPid, undefined, {guildId:stream.communityServer?.guild.id as string})
	}
}

export function skipStream(data: string | undefined) {
	const result = useStream(data);
	if(!result) return;
	const stream = result;
	if(!stream.player?.state) {
		sendPCMessage(MusicWorkerType.music,"skipStream", "pass", stream.musicPid,"MusicIsIdle", {guildId:stream.communityServer?.guild.id as string})
	} else if(stream.player.state.status == AudioPlayerStatus.Buffering) {
		/**
		 * 
		 * return early skipping
		 * 
		 */
		sendPCMessage(MusicWorkerType.music,"skipStream", "failed", stream.musicPid,"EarlyAction", {guildId:stream.communityServer?.guild.id as string})
	} else if (stream.player.state.status == AudioPlayerStatus.Idle) {
		/**
		 * 
		 * return skipped
		 * 
		 */
		sendPCMessage(MusicWorkerType.music,"skipStream", "pass", stream.musicPid,"MusicIsIdle", {guildId:stream.communityServer?.guild.id as string})
	} else {
		stream.player.stop();
		/**
		 * 
		 * return music skipped
		 * 
		 */
		sendPCMessage(MusicWorkerType.music,"skipStream", "success", stream.musicPid, undefined, {guildId:stream.communityServer?.guild.id as string})
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
			sendPCMessage(MusicWorkerType.music,"pauseStream", "failed", stream.musicPid, "AlreadyPaused", {guildId:stream.communityServer?.guild.id as string})
		} else {
			sendPCMessage(MusicWorkerType.music,"pauseStream", "failed", stream.musicPid, "ReadyForStream", {guildId:stream.communityServer?.guild.id as string})
		}
	} else {
		sendPCMessage(MusicWorkerType.music,"pauseStream", "failed", stream.musicPid, "UndefinedPlayerState", {guildId:stream.communityServer?.guild.id as string})
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
			sendPCMessage(MusicWorkerType.music,"resumeStream", "failed", stream.musicPid, "AlreadyPlaying", {guildId:stream.communityServer?.guild.id as string})
		} else {
			sendPCMessage(MusicWorkerType.music,"resumeStream", "failed", stream.musicPid, "ReadyForStream", {guildId:stream.communityServer?.guild.id as string})
		}
	} else {
		sendPCMessage(MusicWorkerType.music,"resumeStream", "failed", stream.musicPid, "UndefinedPlayerState", {guildId:stream.communityServer?.guild.id as string})
	}
}

export function getPlaybackDuration(data: string | undefined) {
	const result = useStream(data);
	if(!result) return;
	const stream = result;

	if(stream.player?.state) {
		if(stream.player.state.status == AudioPlayerStatus.Playing) {
			sendPCMessage(MusicWorkerType.music,"getPlayPlaybackDuration", "success", stream.musicPid, undefined, {guildId:stream.communityServer?.guild.id as string, playbackDuration: stream.player.state.resource.playbackDuration})
		} else {
			sendPCMessage(MusicWorkerType.music,"getPlayPlaybackDuration", "failed", stream.musicPid, "ReadyForStream", {guildId:stream.communityServer?.guild.id as string})
		}
	} else {
		sendPCMessage(MusicWorkerType.music,"getPlayPlaybackDuration", "failed", stream.musicPid, "UndefinedPlayerState",{guildId:stream.communityServer?.guild.id as string})
	}
}


export function useStream(musicIPCdataString: string | undefined, pid?: number) {
	if (!musicIPCdataString) { return }
	const musicIPCdata:musicIPCdataFormat = JSON.parse(musicIPCdataString);
	let stream: Stream;

	
	if(!client.streamQueue.has(musicIPCdata.guildId) && !pid) return;
	if (!client.streamQueue.has(musicIPCdata.guildId) || client.streamQueue.get(musicIPCdata.guildId)?.guild == undefined) {
		stream = new Stream({
			guildId: musicIPCdata.guildId,
			memberId: musicIPCdata.memberId,
			channelId: musicIPCdata.channelId,
			type: "interaction"
		}, musicIPCdata.youtubeId, pid as number)

		client.streamQueue.set(musicIPCdata.guildId,stream);
	}

	stream = client.streamQueue.get(musicIPCdata.guildId) as Stream;
	stream.youtubeId = musicIPCdata.youtubeId
	
	return stream;
}