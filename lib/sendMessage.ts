import { Message, ChatInputCommandInteraction, CacheType, BaseGuildTextChannel, BaseGuildVoiceChannel, ChannelType, Guild, GuildMember, TextBasedChannel, EmbedBuilder, APIEmbed } from "discord.js";
import { CommunityServer } from "../type/type.common";
import { Logger} from '../logManager';
import { Lang } from "./word";
import { useGuild } from "./useGuild";



export function interaction_reply(interaction: ChatInputCommandInteraction | undefined, components: any[],_embed: EmbedBuilder | APIEmbed | undefined){
	if(interaction && _embed) {
		if(interaction.channel) {
			if(interaction.isRepliable()) {
				return interaction.editReply({embeds:[_embed], components: components});
			}
		}
	}
}

export function send_message({ input, embed, component }: { input: Message<boolean>|ChatInputCommandInteraction<CacheType> | Message<true> | CommunityServer, embed: any, component?: any, }): Promise<Message<boolean>> {
	// eslint-disable-next-line no-async-promise-executor
	return new Promise(async(reslove,reject) => {
		let guild: CommunityServer | undefined;
		if(input.type != "CS") {
			guild = useGuild(input);
			if (!guild) return reject(false);
		} else {
			guild = input;
		}

		if(!guild.guild) return reject(false);
		if (isMissingPermission(guild.channel, guild.guild)) {
			if(!guild.member) return reject(false);
			SendUserDM(guild, guild.member);
			return reject(false);
		}

		if (!Array.isArray(component)) {
			component = [];
		}

		try {
			const msg =await guild.channel.send({ embeds: embed, components: component });
			return reslove(msg);
		} catch (e) {
			return reject(false);
		}
	})
}
export function edit_message({ input, embed, component }: { input: Message<boolean>, embed: any, component?: any, logger?: any }): Promise<Message<boolean> | boolean> {

	// eslint-disable-next-line no-async-promise-executor
	return new Promise(async function (reslove, reject) {
		setTimeout(() => {
			return reject(false); // reject 호출
		}, 5000);

		if (!Array.isArray(component)) {
			component = [];
		}

		if (!input.editable) return reject(false);

		try {
			const msg = await input.edit({ embeds: embed, components: component });
			return reslove(msg);
		} catch (e) {
			return reslove(false);
		}
	})
}

function isMissingPermission(channel: BaseGuildTextChannel | BaseGuildVoiceChannel | TextBasedChannel, guild: Guild) {
	const clientUser = guild.members.me;

	if (channel.type == ChannelType.GuildText) {
		if (clientUser) {
			if (!channel.permissionsFor(clientUser).has("SendMessages") || !channel.permissionsFor(clientUser).has("ViewChannel")) {
				return true;
			} else {
				return false;
			}
		}
	} else if (channel.type == ChannelType.GuildVoice) {
		if (clientUser) {
			if (
				!channel.permissionsFor(clientUser).has('Connect') || !channel.permissionsFor(clientUser).has('Speak')
			) {
				return true;
			} else {
				return false;
			}
		}
	}
	return false;
}

function SendUserDM(server: CommunityServer,member:GuildMember) {
	const lang = new Lang(server.guild.id);
	
	if (member.dmChannel == null) {
		member.createDM().then((dm) => {
			dm.send(`${lang.errorMissingTextChannelPermission_Title}\n${lang.errorMissingTextChannelPermission_Description}`)
		})
	} else {
		member.dmChannel.send(`${lang.errorMissingTextChannelPermission_Title}\n${lang.errorMissingTextChannelPermission_Description}`)
	}

	const logger = new Logger(server.member.id,server.guild.id);

	logger.writeLog({
		isCommand: true,
		isError: true,
		error: `client user has missing permission`,
		guildData: {
			guild: { id: server.member.id },
			user: { id: server.guild.id }
		},
		location: {
			dir: __dirname,
			file: __filename,
			func: 'SendUserDM'
		},
		service: {
			serviceType: "music",
			Trigger: 'CommandEvent',
			action: {
				name: "send_embed",
				status: "failed",
			},
			active_loop: 'system_active'
		}
	})
}