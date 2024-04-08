import { AudioPlayer, AudioPlayerError, VoiceConnection, VoiceConnectionStatus, entersState } from "@discordjs/voice";
import { MusicWorkerType } from "../../type/type.versionManager";
import { sendPCMessage } from "./usePC";
import { CommunityServer } from "../../type/type.common";

export function playerEvent(player: AudioPlayer, server: CommunityServer, pid:number) {
	player.on("stateChange", (oldState: { status: string; }, newState: { status: string; }) => {
		if (oldState.status == 'playing' || oldState.status == 'paused' || oldState.status == 'autopaused' && newState.status === 'idle') {
			console.log("music finished")
			sendPCMessage(MusicWorkerType.music, "executeStream", "finished",pid, undefined, { guildId: server?.guild.id as string })
		}
	})
	player.on('error', (e: AudioPlayerError) => {
		if (e.toString() == "Error: Video unavailable") {
			sendPCMessage(MusicWorkerType.music, "executeStream", "failed",pid, "VideoUnavailable", { guildId: server.guild.id})
		} else {
			sendPCMessage(MusicWorkerType.music, "executeStream", "failed",pid, "FailedPlayStream", { guildId: server.guild.id})
		}
	})
}

export function connectionEvent(connection: VoiceConnection, player: AudioPlayer, server: CommunityServer,pid: number) {
	connection.on(VoiceConnectionStatus.Disconnected, async () => {
		try {
			await Promise.race([
				entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
				entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
			]);
			// Seems to be reconnecting to a new channel - ignore disconnect
		} catch (error) {
			/** finish music */
			sendPCMessage(MusicWorkerType.music, "executeStream", "failed",pid, "FailedConnectChannel", { guildId: server.guild.id})
			try {
				player.stop();
			} catch (e) { /** empty */ }

		}
	});
}
