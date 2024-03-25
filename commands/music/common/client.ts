import { BaseGuildTextChannel, BaseGuildVoiceChannel, CacheType, ChatInputCommandInteraction, Guild, GuildMember, Message, TextBasedChannel } from "discord.js";
import { CommunityServer } from '../../../type/type.common';
import { useGuild } from "../../../lib/useGuild";
import { sendEmbed } from "./error/embed";
import { Lang } from "../../../lib/word";
import { serverLogger } from "../../../logManager";
import { PreviewInteraction } from "../../../type/type.index";

export class ClientResource {
	guild: Guild | undefined
	channel: BaseGuildTextChannel | BaseGuildVoiceChannel | TextBasedChannel | undefined
	member: GuildMember | undefined
	communityServer: CommunityServer | undefined
	lang: Lang
	logger = new serverLogger()
	
	sendEmbed = sendEmbed
	constructor(input: ChatInputCommandInteraction<CacheType> | Message<true> | PreviewInteraction) {
		const server: CommunityServer | undefined = useGuild(input)
		this.communityServer = server
		this.guild = server?.guild
		this.channel = server?.channel
		this.member = server?.member

		if(server?.guild.id) {
			this.lang = new Lang(server.guild.id)
		}
	}
}