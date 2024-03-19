import { ChatInputCommandInteraction, Message } from "discord.js";
import { ClientResource } from "./client";

export class Database extends ClientResource {
	constructor(input:ChatInputCommandInteraction | Message<true>) {
		super(input);
	}
}