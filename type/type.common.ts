import { BaseGuildTextChannel, BaseGuildVoiceChannel, CacheType, ChatInputCommandInteraction, Guild, GuildMember, Message, TextBasedChannel } from "discord.js";

export interface CommunityServer {
	guild: Guild,
	channel: TextBasedChannel | BaseGuildTextChannel  | BaseGuildVoiceChannel,
	member: GuildMember,
	message?: Message<boolean>,
	interaction?: ChatInputCommandInteraction<CacheType>
	type: "CS"
}

export type Result<T, E extends null | string> = {
	status: "error" | "success",
	data: T,
	code?: E
}