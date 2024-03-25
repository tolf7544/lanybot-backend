/** version collector */

import { Worker } from "cluster"
import { Guild, GuildChannel, GuildMember, Message } from "discord.js"




/**  */

export enum SecurityVersionName {
	warn = "warn",
	spam = "spam",
	imageFilter = "imageFilter",
}


export enum MusicVersionName {
	music = "music",
	stream = "stream",
}
export const SlashCommandVersionName = {
	...MusicVersionName,
	[SecurityVersionName.warn]:SecurityVersionName.warn,
	
}

export enum ClientVersionName {
}

export type VersionName = keyof typeof MusicVersionName | keyof typeof SecurityVersionName | keyof typeof ClientVersionName

export type Version = Record<VersionName , string>

export const VersionMessageCommandType = [
	SecurityVersionName.imageFilter,
	SecurityVersionName.imageFilter
]

/** interaction & message */
export interface PreviewInteraction {
	guildId: string,
	memberId: string,
	channelId: string,
	type: "interaction",
}

export interface PreviewMessage {
	guild: Guild,
	Author: Message<boolean>["author"],
	member: GuildMember,
	channel: GuildChannel,
	contents: {
		content: string,
		id: string
	},
	type: "message",
	path: string
}

/** process collector */

export type processCollectorKey = string 

export interface ProcessCollectorValue {
	state: "previous" | "active",
	worker: Worker,
	path: string
}