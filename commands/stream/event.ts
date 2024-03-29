import { AudioPlayer, AudioPlayerError, VoiceConnection, VoiceConnectionStatus, entersState } from "@discordjs/voice";
import { MusicWorkerType } from "../../type/type.versionManager";
import { sendPCMessage } from "./usePC";
import { CommunityServer } from "../../type/type.common";

export function playerEvent(player: AudioPlayer, server: CommunityServer | undefined) {
	player.on("stateChange", (oldState: { status: string; }, newState: { status: string; }) => {
		if (oldState.status === 'playing' && newState.status === 'idle') {
			sendPCMessage(MusicWorkerType.music, "executeStream", "finished", undefined, { guildId: server?.guild.id as string })
		}
	})

	player.on('error', (e: AudioPlayerError) => {
		console.log(e)
		if (e.toString() == "Error: Video unavailable") {
			sendPCMessage(MusicWorkerType.music, "executeStream", "failed", "VideoUnavailable", { guildId: server?.guild.id as string })
		} else {
			sendPCMessage(MusicWorkerType.music, "executeStream", "failed", "FailedPlayStream", { guildId: server?.guild.id as string })
		}
	})
}

export function connectionEvent(connection: VoiceConnection, player: AudioPlayer, server: CommunityServer | undefined) {
	connection.on(VoiceConnectionStatus.Disconnected, async () => {
		try {
			await Promise.race([
				entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
				entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
			]);
			// Seems to be reconnecting to a new channel - ignore disconnect
		} catch (error) {
			/** finish music */
			sendPCMessage(MusicWorkerType.music, "executeStream", "failed", "FailedConnectChannel", { guildId: server?.guild.id as string })
			try {
				player.stop();
			} catch (e) { /** empty */ }

		}
	});
}
