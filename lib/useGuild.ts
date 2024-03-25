import { CacheType, Message, Guild, GuildMember, TextBasedChannel, BaseGuildTextChannel, BaseGuildVoiceChannel, InteractionType, MessageType, ChatInputCommandInteraction } from "discord.js";
import { client } from "..";
import { serverLogger } from "../logManager";
import { CommunityServer } from "../type/type.common";
import { PreviewInteraction, PreviewMessage } from "../type/type.index";

export function useGuild(interaction: ChatInputCommandInteraction<CacheType> | Message<boolean> | PreviewMessage | PreviewInteraction): CommunityServer|undefined  {

		
	let guild: Guild | null | undefined;
	let member: GuildMember | null | undefined;
	let channel: TextBasedChannel | BaseGuildTextChannel  | BaseGuildVoiceChannel | undefined |null;
	let GuildId: string | null;
	let playerId: string | null;

	if(interaction.type == "interaction") {
		GuildId = interaction.guildId;
		playerId = interaction.memberId;
		if (GuildId) {
			guild = client.guilds.cache.get(GuildId);
			if (guild) {
				member = guild.members.cache.get(playerId);
				channel = guild.channels.cache.get(interaction.channelId) as TextBasedChannel | BaseGuildTextChannel  | BaseGuildVoiceChannel
			if(member) {
					return {guild:guild,member:member, channel:channel,type:'CS'};
				} else {
				serviceLogger(" member or channel data is undefined\ndisocrd_api_service occured error")
				return;
				}
			} else {
				serviceLogger(" guild data is undefined\ndisocrd_api_service occured error")
				return;
			}
		} else {
			serviceLogger(" GuildId is undefined\ndisocrd_api_service occured error")
			return;
		}
	} else if(interaction.type == "message") {
		return;
	} else if (interaction.type == InteractionType.ApplicationCommand) {
		GuildId = interaction.guildId;
		playerId = interaction.user.id;

		if (GuildId) {
			guild = client.guilds.cache.get(GuildId);
			if (guild) {
				member = guild.members.cache.get(playerId);
				channel = interaction.channel;
			if(member && channel) {
					return {guild:guild,member:member,channel:channel,type:'CS', interaction: interaction};
				} else {
				serviceLogger(" member or channel data is undefined\ndisocrd_api_service occured error")
				return;
				}
			} else {
				serviceLogger(" guild data is undefined\ndisocrd_api_service occured error")
				return;
			}
		} else {
			serviceLogger(" GuildId is undefined\ndisocrd_api_service occured error")
			return;
		}
	} else if (interaction.type == MessageType.Default) {
		GuildId = interaction.guildId;
		playerId = interaction.author.id;

		if (GuildId) {
			guild = client.guilds.cache.get(GuildId);
			if (guild) {
				member = guild.members.cache.get(playerId);
				channel = interaction.channel;
				if(member) {
					return {guild:guild,member:member,channel:channel,type:'CS', message:interaction};
				} else {
					serviceLogger(" member is undefined\ndisocrd_api_service occured error")
					return;
				}
			} else {
				serviceLogger(" guild data is undefined\ndisocrd_api_service occured error")
				return;
			}
		} else {
			serviceLogger(" GuildId is undefined\ndisocrd_api_service occured error")
			return;
		}
	} else {
		serviceLogger("unknown error occured")
		return;
	}
}

function serviceLogger(error: string) {
	const logger = new serverLogger();

	logger.writeLog({
		isError: true,
		isCommand: true,
		error: error,
		location: {
			dir: __dirname,
			file: __filename,
			func: "getServerData"
		},
		service: {
			serviceType: "any",
			Trigger: "clientEvent",
			action: {
				name: "get_guild_data",
				status: "failed",
			},
			active_loop: "system_active",
		}
	})
}