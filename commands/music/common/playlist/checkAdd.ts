/* eslint-disable no-async-promise-executor */
import {  AnySelectMenuInteraction } from "discord.js"
import { PlaylistItem } from "../../../../type/type.queue"
import { CommunityServer, Result } from "../../../../type/type.common"
import { Common, DiscordMessage } from "../../../../type/type.error"
import { checkPlaylistAddEmbed, checkPlaylistAddRow } from "./embed"
import { send_message } from "../../../../lib/sendMessage"

export function checkPlaylistAdd(videos: PlaylistItem[],guild:CommunityServer): Promise<Result<boolean, null>> {
	return new Promise(async (resolve:((sucess:Result<boolean, null>) => void), reject:((error:Result<object, DiscordMessage | Common>) => void)) => {
		try {
			const {embed,embed1,embed2 } =checkPlaylistAddEmbed(guild,videos);
			const {row} =checkPlaylistAddRow(guild);
			const _embed = await send_message({ input: guild, embed: [embed], component: [row] }).catch(() => {/** empty */ })
			if (_embed && typeof _embed != "boolean") {


				const filter = (i: { user: { id: any; }; }) => i.user.id == guild.member.id;
				const collector = await _embed.createMessageComponentCollector({ filter })

				collector.on('end', async () => {
					collector.stop();
				})

				collector.on('collect', async (i: AnySelectMenuInteraction) => {

					if (i.customId == `add`) {
						if (_embed.editable) {
							await _embed.edit({ embeds: [embed1], components: [] });
							collector.stop();
						}
						return resolve({
							status: "success",
							data: true
						})
					} else if (i.customId == 'exit') {
						if (_embed.editable) {
							await _embed.edit({ embeds: [embed2], components: [] });
							collector.stop();
						}
						return resolve({
							status: "success",
							data: false
						})
					}
				})
			} else {
				reject({
					status: "error",
					data: {
						isError: true,
						isCommand: true,
						location: {
							dir: __dirname,
							file: __filename,
							func: 'checkDoesPlaylistAdd'
						},
						guildData: {
							guild: { id: guild.guild.id },
							user: { id: guild.member.id }
						},
						service: {
							serviceType: "music",
							Trigger: "collector",
							action: {
								name: 'send_embed',
								status: 'failed',
							},
							active_loop: "system_active",
						},
						cmd: {
							name: "play",
							status: "running"
						}
					},
					code: DiscordMessage.send_message_failed
				})
			}
		} catch (e) {
		
			reject({
				status: "error",
				data:{
				isError: true,
				isCommand: true,
				location: {
					dir: __dirname,
					file: __filename,
					func: 'checkDoesPlaylistAdd'
				},
				guildData: {
					guild: {id: guild.guild.id},
					user: {id: guild.member.id}
				},
				error: e,
				service: {
					serviceType: "music",
					Trigger: "collector",
					action: {
						name: 'collect_data',
						status: 'failed',
					},
					active_loop: "system_active",
				},
				cmd: {
					name: "play",
					status: "running"
				}
			},
			code: Common.try_catch})
		}
	})
}