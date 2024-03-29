import { Collection, Guild } from "discord.js";
import { AddSlashCommand, InteractionReact, client } from "..";
import { clearSystemMsg } from "../commands/music/common/embed";
import { Lang } from "../lib/word";
import { sendStreamPCMessage } from "../commands/music/common/useStreamPC";
import { MusicWorkerType } from "../type/type.versionManager";

export default function music() {
	client.commands = new Collection();
	client.music = new Collection();
	
	AddSlashCommand();
	InteractionReact();

	client.on("voiceStateUpdate", (VoiceChannel) => {
		if (!VoiceChannel.guild.members.me) return;

		if (!VoiceChannel.guild.members.me.voice.channel) {
			if (!client.music.has(VoiceChannel.guild.id)) return;
			/**
			 *  통화방에 참여x
			 *  서버리스트에 존재하나 재생 상태가 존재하지 않음 (status--> play, pause, buffering, idle)
			 */
			return clearServerData(VoiceChannel.guild, "listClear");
		} else {
			if (!client.music.has(VoiceChannel.guild.id)) return clearServerData(VoiceChannel.guild, "disconnect");
			if (VoiceChannel.guild.members.me.voice.channel.members.size == 1) return clearServerData(VoiceChannel.guild, "disconnect");
	
			const DiscordStream = client.music.get(VoiceChannel.guild.id);
			/**
			 *
			 * 통화방 참여 o
			 * 서버리스트에 데이터 존재 o
			 * 통화방 인원이 1명 이상임
			 * 
			 */
			if (DiscordStream?.queue.size == 0) return clearServerData(VoiceChannel.guild, "listClear");
		}
	})
} 

function clearServerData(server: Guild, option: "disconnect" | "listClear") {
	const lang = new Lang(server.id);
	const musicStream = client.music.get(server.id);
	sendStreamPCMessage(MusicWorkerType.stream,"clearStream",{
		guildId: server.id,
		youtubeId: "undefined",
		memberId: "undefined",
		channelId: "undefined"
	})
	if (option == "disconnect") {
		if (!server.members.me) return;
		if (musicStream) {
			if (musicStream.queue.size >= 1) clearSystemMsg('common',lang,server.id,musicStream.queue.active());
		}
		server.members.me.voice.disconnect();
		client.music.delete(server.id);
	} else {
		if (musicStream) {
			if (musicStream.queue.size >= 1) clearSystemMsg('common',lang,server.id,musicStream.queue.active());
		}
		client.music.delete(server.id);
	}
}