import { ActionRowBuilder, AnyComponentBuilder, AnySelectMenuInteraction, EmbedBuilder, Message, PermissionFlagsBits, StringSelectMenuBuilder } from "discord.js";
import { icon } from "../../../lib/icon";
import { Metadata } from "./queue/metadata";
import { Lang } from "../../../lib/word";
import { CommunityServer } from '../../../type/type.common';
import { edit_message, send_message } from '../../../lib/sendMessage';
import { sendEmbed } from "./error/embed";
import { Common, Streaming } from "../../../type/type.error";
import { Logger } from "../../../logManager";
import { client } from "../../..";
import { Queue } from "./queue";
import { setTime } from "./yt_video/getMusicData";

export function addEmbed(stream: Metadata, server: CommunityServer, queueSize: number) {
	const lang = new Lang(server.guild.id)
	const embed = new EmbedBuilder()
		.setAuthor({ iconURL: icon.check, name: `${lang.addEmbed_Title}` })
		.setTitle(`${stream.MusicData.title}`)
		.setURL(stream.url)
		.setDescription(`${lang.addEmbed_Description[0]}:${stream.MusicData.time}\n${lang.addEmbed_Description[1]}:${queueSize - 1}`)
		.setThumbnail(`${stream.MusicData.thumbnail}`)
		.setColor(`Green`)
		.setFooter({ text: server.member.displayName })
		send_message({ input: server, embed: [embed], component: [] }).catch(() => {/** empty */ })

}
export function endEmbed(server: CommunityServer) {
	const lang = new Lang(server.guild.id)
	const embed = new EmbedBuilder()
		.setAuthor({ iconURL: icon.check, name: `${lang.end_Title}` })
		.setColor(`Green`)

	send_message({ input: server, embed: [embed], component: [] }).catch(() => {/** empty */ })
}
export function skipEmbed(message: Metadata, server: CommunityServer) {
	const lang = new Lang(server.guild.id)
	const embed = new EmbedBuilder()
		.setAuthor({ iconURL: `${icon.skip}`, name: `${lang.skip_Title}` })
		.setTitle(`${message.MusicData.title}`)
		.setURL(message.url)
		.setColor(`Green`)
		.setFooter({ text: server.member.displayName })
		send_message({ input: server, embed: [embed], component: [] }).catch(() => {/** empty */ })
}
export function pauseEmbed(server: CommunityServer, metadata: Metadata) {
	const lang = new Lang(server.guild.id)
	const embed = new EmbedBuilder()
		.setAuthor({ iconURL: `${icon.pause}`, name: `${lang.pause_Title}` })
		.setTitle(`${metadata.MusicData.title}`)
		.setColor(`Green`)
		.setFooter({ text: server.member.displayName })
	send_message({ input: server, embed: [embed] }).catch(() => { /** empty */ });
}

export function unpauseEmbed(server: CommunityServer, metadata: Metadata) {
	const lang = new Lang(server.guild.id)
	const embed = new EmbedBuilder()
		.setAuthor({ iconURL: `${icon.play}`, name: `${lang.resume_Title}` })
		.setTitle(`${metadata.MusicData.title}`)
		.setColor(`Green`)
		.setFooter({ text: server.member.displayName })
	send_message({ input: server, embed: [embed] }).catch(() => { /** empty */ });
}

export function preStreamEmbed2(server: CommunityServer) {
	const lang = new Lang(server.guild.id)

	const embed = new EmbedBuilder()
		.setAuthor({ iconURL: `${icon.warn}`, name: `${lang.preStream_title2}` })
		.setColor(`Orange`)
		.setFooter({ text: server.member.displayName })

		send_message({ input: server, embed: [embed], component: [] }).catch(() => {/** empty */ })
}

export function preStreamEmbed(server: CommunityServer, metadata: Metadata) {
	const lang = new Lang(server.guild.id)
	const embed = new EmbedBuilder()
		.setAuthor({ iconURL: `${icon.play}`, name: `${lang.preStream_title}` })
		.setTitle(`${metadata.MusicData.title}`)
		.setThumbnail(metadata.MusicData.thumbnail)
		.setColor(`Green`)
		.setFooter({ text: server.member.displayName })

	send_message({ input: server, component: [], embed: [embed] }).catch(() => {/** empty */ })
}
export function nextSteamEmbed2(server: CommunityServer) {
	const lang = new Lang(server.guild.id)

	const embed = new EmbedBuilder()
		.setAuthor({ iconURL: `${icon.warn}`, name: `${lang.nextStream_title2}` })
		.setColor(`Orange`)
		.setFooter({ text: server.member.displayName })
		send_message({ input: server, embed: [embed], component: [] }).catch(() => {/** empty */ })
}

export function nextSteamEmbed(server: CommunityServer, metadata: Metadata) {
	const lang = new Lang(server.guild.id)
	const embed = new EmbedBuilder()
		.setAuthor({ iconURL: `${icon.play}`, name: `${lang.nextStream_title}` })
		.setTitle(`${metadata.MusicData.title}`)
		.setThumbnail(metadata.MusicData.thumbnail)
		.setColor(`Green`)
		.setFooter({ text: server.member.displayName })

		send_message({ input: server, embed: [embed], component: [] }).catch(() => {/** empty */ })
}

export function shuffleEmbed(server: CommunityServer, queue: Queue) {
	const lang = new Lang(server.guild.id)
	const _queue = Array.from(queue.values())
	let titles = '';
	let max = 5;
	if (_queue.length < 5) {
		max = _queue.length
	}
	for (let i = 0; i < max; i++) {
		titles += `> ${i + 1}.` + _queue[i].MusicData.title + "\n"
	}
	if (_queue.length > 5) {
		titles += `${lang.shuffle_Title[0]} ${_queue.length - 5}${lang.shuffle_Title[1]}!`
	}

	const embed = new EmbedBuilder()
		.setAuthor({ iconURL: `${icon.shuffle}`, name: `${lang.shuffle_Title[2]}` })
		.setDescription(titles)
		.setColor(`Green`)
		.setFooter({ text: server.member.displayName })
		send_message({ input: server, embed: [embed], component: [] }).catch(() => {/** empty */ })
}

export function clearEmbed(server: CommunityServer) {
	const lang = new Lang(server.guild.id)
	const embed = new EmbedBuilder()
		.setAuthor({ iconURL: `${icon.play}`, name: `${lang.clear_queue_title}` })
		.setColor(`Green`)
		send_message({ input: server, embed: [embed], component: [] }).catch(() => {/** empty */ })
}

export function loopEmbed(server: CommunityServer, input: string, metadata: Metadata | undefined) {
	const lang = new Lang(server.guild.id)
	let title = '';
	let description = '';
	if (input == 'single') {
		title = lang.loopSingle_Title;
		description = metadata?.MusicData.title ? metadata?.MusicData.title : "None"
	} else {
		title = lang.loopAll_Title;
		description = lang.loopAll_Description
	}

	let footer = lang.loopFooter_Title

	if (input == "exit") {
		title = lang.loopExit_Title
		footer = lang.loopExitFooter_Title;
	}

	const embed = new EmbedBuilder()
		.setAuthor({ iconURL: `${icon.loop}`, name: `${title}` })
		.setDescription(`${lang.loop_Description} ${description.substring(0, 80)}`)
		.setColor(`Green`)
		.setFooter({ text: `${footer}\n${server.member.displayName}` });

	send_message({ input: server, embed: [embed] }).catch(() => { /** empty */ });
}

export async function showStream(server: CommunityServer, playingMusic: Metadata, playbackDuration: number) {
	const lang = new Lang(server.guild.id);
	const currentTime = playbackDuration;
	const activeTimeStamp = setTime(currentTime / 1000, server);
	const maxTimeStamp = playingMusic.MusicData.time;
	const DESTimeStamp = lang.showStream_des(maxTimeStamp, activeTimeStamp)
	const title = playingMusic.MusicData.title
	const Thumbnail = playingMusic.MusicData.thumbnail;
	const _embed = new EmbedBuilder()
		.setAuthor({ name: lang.showStream_title, iconURL: icon.eq })
		.setTitle(title)
		.setDescription(DESTimeStamp)
		.setThumbnail(Thumbnail)
	await send_message({ input: server, embed: [_embed], component: [] }).catch(() => {/** empty */ })
}

export function playEmbed(stream: Metadata, server: CommunityServer, lang: Lang, queueSize: number) {
	const Stream = client.music.get(server.guild.id);
	const _component: ActionRowBuilder<AnyComponentBuilder>[] = [];
	const L: { label: string, description: string, value: string }[] = [];
	if (!Stream) return;

	try {
		const embed = new EmbedBuilder()
			.setAuthor({ iconURL: icon.play, name: `${lang.playEmbed_Title}` })
			.setTitle(stream.MusicData.title)
			.setDescription(` ${lang.playEmbed_Description[0]}:${stream.MusicData.time}\n ${lang.playEmbed_Description[1]}:${queueSize}`)
			.setURL('https://youtu.be/' + stream.id)
			.setImage(`${stream.MusicData.thumbnail}`)
			.setColor(`Green`)
			.setFooter({ text: server.member.displayName })
		if (stream.RecommendVideos || stream.RecommendVideos != "ADULT") {
			if (stream.RecommendVideos?.size > 1) {
				let length = stream.RecommendVideos.size - 1
				if (length > 20) {
					length = 20
				}
				for (let i = 0; i < length; i++) {
					const data = Array.from(stream.RecommendVideos.entries())[i][1];

					if (data.title != undefined) {
						L.push({
							label: `${data.title.substring(0, 95)}`,
							description: `${data.channelName.substring(0, 75)} | ${data.time}`,
							value: `${Array.from(stream.RecommendVideos.entries())[i][0]}`
						})
					}
				}

				const selectQueue = new ActionRowBuilder()
					.addComponents(
						new StringSelectMenuBuilder()
							.setCustomId('SELECT_RECOMMEND_VIDEO')
							.setPlaceholder(lang.playEmbedSelectQueue_Title)
							.setMaxValues(1)
							.setMinValues(1)
							.addOptions(L),
					)

				_component.push(selectQueue);
			} else {
				deleteInteraction(server)
				send_message({ input: server, component: _component, embed: [embed] })
			}
		} else if (stream.RecommendVideos == "ADULT") {
			return sendEmbed(server, Streaming.adult_contents);
		} else {
			deleteInteraction(server)
			embed.addFields({ name: "추천재생목록을 불러올수없습니다.", value: "음악은 게속 재생됩니다!" })
			return send_message({ input: server, component: _component, embed: [embed] })
		}
		deleteInteraction(server)

		send_message({ input: server, component: _component, embed: [embed] }).catch(() => { /**  */ })
			.then(async (_embed) => {
				if (!_embed) {
					discordEmbedErrorLogger(server);
					sendEmbed(server, Common.try_catch)
				} else {


					Stream.messages.set("playEmbed", _embed)

					const filter = ((i: any) => {
						if (i.user.id === server.member.id) {
							return true; // true
						} else if (i.memberPermissions) {
							if (i.memberPermissions.bitfield == PermissionFlagsBits.Administrator || i.memberPermissions.bitfield == PermissionFlagsBits.ModerateMembers || i.memberPermissions.bitfield == PermissionFlagsBits.ManageGuild || i.memberPermissions.bitfield == PermissionFlagsBits.ManageEvents || i.memberPermissions.bitfield == PermissionFlagsBits.SendVoiceMessages) {
								return true;
							} else {
								return false;
							}
						} else {
							return false;
						}
					});

					const collector = await _embed.createMessageComponentCollector({ filter })

					collector.on('end', async () => {
						collector.stop();
					})

					collector.on('collect', async (i: AnySelectMenuInteraction) => {

						if (i.customId == `SELECT_RECOMMEND_VIDEO`) {

							for (let j = 0; j < i.values.length; j++) {
								await Stream.queue.add("https://www.youtube.com/watch?v=" + i.values[j], false, server, ((metadata: Metadata) => {
									addEmbed(metadata, server, Stream.queue.size)
								}));

							}
							if (i.isRepliable()) {
								i.deferUpdate();
							}
						}
					})
				}
			})

	} catch (e: unknown) {
		if (server) {
			discordEmbedErrorLogger(server, e);
		}
		sendEmbed(server, Common.try_catch)

	}
}

export function clearSystemMsg(common: 'common' | 'loop' | 'error' | 'error1', lang: Lang, GuildId: string | undefined): void {
	if (!GuildId) return;
	const Stream = client.music.get(GuildId)
	if (!Stream) return;
	const communityServer = Stream.communityServer
	const message = Stream.messages.get("playEmbed")
	if (!communityServer) return;
	if (!message) return;
	const embed = new EmbedBuilder()
		.setAuthor({ iconURL: icon.check, name: lang.clearSystemMsg_embed_Title })
		.setDescription(`${lang.clearSystemMsg_Description}:${message.embeds[0].title + " "}\n`)
		.setImage(`${message.embeds[0].image?.url}`)
		.setColor(`Green`)
		.setFooter({ text: communityServer.member.displayName })

	const embedLoop = new EmbedBuilder()
		.setAuthor({ iconURL: icon.check, name: lang.clearSystemMsg_embedLoop_Title })
		.setDescription(`${lang.clearSystemMsg_Description}:${message.embeds[0].title + " "}\n`)
		.setImage(`${message.embeds[0].image?.url}`)
		.setColor(`Green`)
		.setFooter({ text: communityServer.member.displayName })

	const embedE = new EmbedBuilder()
		.setAuthor({ iconURL: icon.warn, name: lang.clearSystemMsg_embedE_Title })
		.setDescription(`${lang.clearSystemMsg_embedE_Description[0]} **[${message.embeds[0].title}]** ${lang.clearSystemMsg_embedE_Description[1]}\n`)
		.setThumbnail(`${message.embeds[0].image?.url}`)
		.setColor(`Orange`)
		.addFields({ name: 'Tip_', value: `${lang.clearSystemMsg_embedE_Footer[0]} [youtube Link](${message.embeds[0].url}) ${lang.clearSystemMsg_embedE_Footer[1]} ` })
		.setFooter({ text: communityServer.member.displayName })

	const embedE1 = new EmbedBuilder()
		.setAuthor({ iconURL: icon.warn, name: lang.clearSystemMsg_embedE1_Title })
		.setThumbnail(`${message.embeds[0].image?.url}`)
		.setColor(`Red`)
		.addFields({ name: 'Tip_', value: `[youtube Link](${message.embeds[0].url})` })
		.setFooter({ text: communityServer.member.displayName })
	try {
		if (common == 'error1') {
			communityServer.channel.messages.fetch(message.id)
				.then((message: Message) => { edit_message({ input: message, embed: [embedE1] }).catch(() => {/** empty */ }) })
				.catch(() => { send_message({ input: communityServer, embed: [embedE1] }).catch(() => {/** empty */ }) })

		} else if (common == 'error') {
			communityServer.channel.messages.fetch(message.id)
				.then((message: Message) => { edit_message({ input: message, embed: [embedE] }).catch(() => {/** empty */ }) })
				.catch(() => { send_message({ input: communityServer, embed: [embedE] }).catch(() => {/** empty */ }) })

		} else if (common == 'loop') {
			communityServer.channel.messages.fetch(message.id)
				.then((message: Message) => { edit_message({ input: message, embed: [embedLoop] }).catch(() => {/** empty */ }) })
				.catch(() => { })

		} else {
			communityServer.channel.messages.fetch(message.id)
				.then((message: Message) => { edit_message({ input: message, embed: [embed] }).catch(() => {/** empty */ }) })
				.catch(() => { })
		}
		Stream.messages.delete("playEmbed")
	} catch (e) { /* empty */ }
	return
}

function discordEmbedErrorLogger(server: CommunityServer, e?: unknown) {
	const logger = new Logger(server.member.id, server.guild.id)
	logger.writeLog({
		guildData: {
			guild: { id: server.guild.id },
			user: { id: server.member.id }
		},
		error: e,
		message: "if \"error\" is null,it maybe send_message func error occured.",
		location: {
			dir: __dirname,
			file: __filename,
			func: "playEmbed",
		},
		isError: false,
		isCommand: false,
		service: {
			serviceType: 'music',
			Trigger: "clientEvent",
			action: {
				name: "send_embed",
				status: 'failed'
			},
			active_loop: "system_active"
		},
		cmd: {
			name: 'play',
			status: 'running',
		}
	});
}

function deleteInteraction(server: CommunityServer) {
	if (server.interaction) {
		if(server.interaction.isRepliable()) {
			try{
				if(server.interaction.replied) {
					/** pass */
				} else {
					server.interaction.deleteReply();
				}
			}catch(e) { /** empty  */}
		}
	}
}