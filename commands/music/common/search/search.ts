/* eslint-disable no-prototype-builtins */
import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, APIActionRowComponent, APIMessageActionRowComponent } from 'discord.js'

import { client } from "../../../..";
import { error } from 'winston';
import { Lang } from '../../../../lib/word';
import { icon } from '../../../../lib/icon';
import { Search, recomendMusicData } from '../yt_video/searchingQuery';
import { CommunityServer } from '../../../../type/type.common';
import { interaction_reply } from '../../../../lib/sendMessage';
import { Common, DiscordMessage } from '../../../../type/type.error';
import { serverLogger } from '../../../../logManager';




const searchingQueueMap = new Map();

interface infoArr {
	label: string,
	description: string,
	value: string
}

export function search(server: CommunityServer, query: string): Promise<string | string[]> {

	return new Promise((resolve) => { // search promise teturn boolean or void
		const lang = new Lang(server.guild.id)
		stop_collecting(server);

		/*************************************************************************************************** */
		Search(query).then((data: Map<string, recomendMusicData>) => {

			if (typeof data != 'object') return error(lang.errorCantUseQuery_Title, lang.errorCantUseQuery_Description, server);
			if (data.size < 1) return error(lang.noExistSearchedData_Title, lang.notExistSearchedData_Description, server);

			const InfoArr: Array<infoArr> = [];

			let length = data.size - 1
			if (length > 20) {
				length = 21
			}


			for (let i = 0; i < length; i++) {
				const videoInfo: recomendMusicData = [...data][i][1];
				const id = [...data][i][0];
				/*InfoMap.set(i, videoInfo);*/

				InfoArr.push({
					label: `${videoInfo.title.substr(0, 95)}`,
					description: `${videoInfo.channelName.substr(0, 75) + ` | ` + videoInfo.Time}`,
					value: `${server.guild.id}.${server.member.id}.${id}`
				})
			}

			/**
			if (data.nonK.size < 10) {
				for (let i = 0; i < data.k.size - 1; i++) {
					let videoInfo = [...data.k][i][1];
					/*InfoMap.set(i, videoInfo);*//**
			if (InfoArr.length < 20) {
				if (InfoArr.filter(res => res.label == `${videoInfo.title.substr(0, 95)}`).length == 0) {
					InfoArr.push({
						label: `${videoInfo.title.substr(0, 95)}`,
						description: `${videoInfo.channelName.substr(0, 75) + ` | ` + videoInfo.Time}`,
						value: `${[...data.k][i][0]}`
					})
				}
			}
		};
	};
	*/

			/*************************************************************************************************** */
			const id = server.member.id + server.guild.id;
			const interaction = server.interaction as ChatInputCommandInteraction 
			searchingQueueMap.set(id, { keyword: query, values: InfoArr, map_data: data });
			const component = new ActionRowBuilder().addComponents(component_active(searchingQueueMap, id, lang)) as unknown as APIActionRowComponent<APIMessageActionRowComponent>;
			const component2 = new ActionRowBuilder().addComponents(component_button(lang)) as unknown as APIActionRowComponent<APIMessageActionRowComponent>;
			const embed = [embed_active(searchingQueueMap, id, server, lang)];
			/*************************************************************************************************** */

			try {
				interaction.editReply({ embeds: embed, components: [component,component2] }).then((_interaction) => {




					const filter = (i: any) => i.user.id == server.member.id;

					const collector = _interaction.createMessageComponentCollector({ filter, time: 60000 });

					searchingQueueMap.set(id, { keyword: query, values: InfoArr, collector: collector, map_data: data });
					/*************************************************************************************************** */

					collector.on('end', async (collected: any) => {

						if (collected.size > 0 && [...collected][0] ? [...collected][0][1].componentType == 3 : false) {

							get_guild_data([...collected][0][1], ((res: any) => {
								if (res.state == true) {
									const _embed = embed_success([...collected][0][1].values[0], res.map_data, server, lang)
									interaction_reply(server.interaction,[],_embed)
								} else {
									const _embed = embed_error(server, lang)
									interaction_reply(server.interaction,[],_embed)
								}
							}))

						} else {
							const _embed = embed_end(lang)
							interaction_reply(server.interaction,[],_embed)

							stop_collecting(server)
							if (searchingQueueMap.has(id)) {
								const data = client.music.get(id)
								if (data) {
									if (data.queue.size == 0) searchingQueueMap.delete(id);
								}
							}
						}
					})

					collector.on('collect', async (interaction: any) => {
						if (interaction.customId == `finish_select_menu`) {
							stop_collecting(server)
							if (client.music.has(server.guild.id)) {
								const data = client.music.get(server.guild.id);
								if (data) {
									if (data.queue.size == 0) {
										client.music.delete(server.guild.id)
									}
								}
							}
							return
						}

						if (interaction.customId == `select_queue`) {
							if (typeof interaction.values[0] == 'string') {
								const listId = interaction.values[0].match(/(.+?)\./g)
								stop_collecting(server)
								if (listId) {
									if (searchingQueueMap.has(listId[1].replace(".", "") + listId[0].replace(".", ""))) {
										const id = interaction.values[0].replace(`${listId[0]}${listId[1]}`, "")

										resolve([id])
									} else {
										if (searchingQueueMap.has(id)) {
											searchingQueueMap.delete(id);
										}
										resolve(DiscordMessage.failed_get_from_message_collector)
									}
								} else {
									if (searchingQueueMap.has(id)) {
										searchingQueueMap.delete(id);
									}
									resolve(DiscordMessage.failed_get_from_message_collector)
								}
							} else {
								const _embed = embed_error(server, lang)
								interaction_reply(server.interaction,[],_embed)
								if (searchingQueueMap.has(id)) {
									searchingQueueMap.delete(id);
								}
								resolve(DiscordMessage.failed_get_from_message_collector)
						
							}
						}
					})
				}).catch((e: boolean) => {
					if (e == false) {
						return Common.api_issue
					}
				})
			} catch (e) {
				unknown_error_logger(server.guild.id, server.member.id, e);
				resolve(Common.try_catch)
			}
			/*************************************************************************************************** */
		}).catch((e) => {
			if (e) {
				error(lang.errorSearchUnknown_Title, `${e}`, server);
			}
		}).catch(() => {
			return error(lang.errorCantSearchThisQuery_Title, lang.errorCantSearchThisQuery_Description, server);
		})
	})
}

function get_guild_data(i: CommunityServer, run: { (res: any): void; (arg0: { state: boolean; keyword?: any; values?: any; collector?: any; map_data?: any; }): void; }) {

	if (searchingQueueMap.has(i.member.id + i.guild.id)) {
		const { keyword, values, collector, map_data } = searchingQueueMap.get(i.member.id + i.guild.id)
		run({ state: true, keyword: keyword, values: values, collector: collector, map_data: map_data })
	} else {
		run({ state: false })
	}
}

function stop_collecting(i: CommunityServer) {
	try {
		if (searchingQueueMap.has(i.member.id + i.guild.id)) {
			const values = searchingQueueMap.get(i.member.id + i.guild.id);
			if (values.hasOwnProperty('collector')) {
				if (!values.collector.ended) {
					values.collector.stop();
				}
			}
		}
	} catch (e) { /* empty */ }
}

function embed_error(i: CommunityServer, lang: Lang) {
	const username = i.member.displayName as string

	return new EmbedBuilder()
		.setAuthor({ iconURL: `${icon.warn}`, name: lang.searchFinished_Title })
		.setColor(`Red`)
		.setFooter({ text: `${username}` })
		.setFooter({ text: `${username}` })
}

function embed_end(lang: Lang) {
	return new EmbedBuilder()
		.setAuthor({ iconURL: `${icon.check}`, name: lang.errorSearchFinished_Title })
		.setColor(`Green`)

}

function embed_success(Vid: any, data: any, i: CommunityServer, lang: Lang) {
	const listId = Vid.match(/(.+?)\./g)
	Vid = Vid.replace(`${listId[0]}${listId[1]}`, "")

	const title = data?.has(Vid) ? data.get(Vid).title : 'error';

	const artist = data?.has(Vid) ? data.get(Vid).channelName : 'error';
	const thumbnail = data?.has(Vid) ? data.get(Vid).thumbnail : 'error';

	if (thumbnail == 'error') return undefined

	return new EmbedBuilder()
		.setAuthor({ iconURL: `${icon.add}`, name: lang.searchSuccess_Title })
		.setDescription(` ${lang.searchSuccess_Description[0]}: ${title}\n ${lang.searchSuccess_Description[1]}: ${artist}`)
		.setThumbnail(thumbnail)
		.setColor(`Green`)
		.setFooter({ text: `${i.member.displayName}` })
}

function embed_active(searchingQueueMap: Map<any, any>, id: any, i: CommunityServer, lang: Lang) {
	const info = searchingQueueMap.get(id);


	return new EmbedBuilder()
		.setAuthor({ iconURL: `${icon.search}`, name: lang.searchActiveEmbed_Title })
		.setDescription(`${lang.searchActiveEmbed_Description[0]} **${info.keyword}** \n${lang.searchActiveEmbed_Description[1]}`)
		.setColor(`Orange`)
		.setFooter({ text: `${i.member.displayName}` })
}

function component_active(searchingQueueMap: Map<any, any>, id: any, lang: Lang) {
	return new StringSelectMenuBuilder()
		.setCustomId('select_queue')
		.setPlaceholder(lang.playEmbedSelectQueue_Title)
		.setMaxValues(1)
		.setMinValues(1)
		.addOptions(searchingQueueMap.get(id).values)

}

function component_button(lang: Lang) {
	return new ButtonBuilder()
		.setCustomId(`finish_select_menu`)
		.setLabel(lang.searchCancel_Title)
		.setStyle(ButtonStyle.Danger)
}

function unknown_error_logger(guildId: string, userId: string, error: unknown) {
	new serverLogger().writeLog({
		isCommand: true,
		isError: false,
		error: error,
		guildData: {
			guild: { id: guildId },
			user: { id: userId }
		},
		location: {
			dir: __dirname,
			file: __filename,
			func: 'search'
		},
		service: {
			serviceType: "music",
			Trigger: "clientEvent",
			action: {
				name: "send_embed",
				status: "failed",
			},
			active_loop: "system_active"
		},
		cmd: {
			name: "play",
			status: "end",
		}
	})
}