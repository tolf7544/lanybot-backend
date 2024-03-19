import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js"
import { CommunityServer } from "../../../../type/type.common"
import { icon } from "../icon"
import { PlaylistItem } from "../../../../type/type.queue"
import { Lang } from "../../../../lib/word"

export function checkPlaylistAddEmbed(guild: CommunityServer, videos: PlaylistItem[]) {
	const lang = new Lang(guild.guild.id)
	const username = guild.member.displayName as string

	return {
		embed: new EmbedBuilder()
			.setAuthor({ iconURL: `${icon.warn}`, name: `${lang.checkDoesPlaylistAdd_Title[0]}${videos.length}${lang.checkDoesPlaylistAdd_Title[1]}` })
			.setDescription(`${lang.checkDoesPlaylistAdd_Description}`)
			.setColor(`Orange`)
			.setFooter({ text: `${username}` }),
		embed1: new EmbedBuilder()
			.setAuthor({ iconURL: `${icon.check}`, name: lang.checkDoesPlaylistAddTrue_Title })
			.setColor(`Green`)
			.setFooter({ text: `${username}` }),
		embed2: new EmbedBuilder()
			.setAuthor({ iconURL: `${icon.check}`, name: lang.checkDoesPlaylistAddFalse_Title })
			.setColor(`Green`)
			.setFooter({ text: username })
	}

}

export function checkPlaylistAddRow(guild: CommunityServer) {
	const lang = new Lang(guild.guild.id)

	const row = new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder({
				custom_id: 'add',
				style: ButtonStyle.Success,
				label: lang.checkDoesPlaylistAddButton_Title,
				emoji: {
					name: 'plus',
					id: '1117124913204035604',
				},
			}),
			new ButtonBuilder({
				custom_id: 'exit',
				style: ButtonStyle.Success,
				label: lang.checkDoesPlaylistCancelButton_Title,
				emoji: {
					name: 'delete',
					id: '1119863749025730632',
				},
			}));

	return { row }

}