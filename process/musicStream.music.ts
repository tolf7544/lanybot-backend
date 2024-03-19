import { Collection } from "discord.js";
import { AddSlashCommand, InteractionReact, client } from "..";

export default function music() {
	client.commands = new Collection();
	client.music = new Collection();
	
	AddSlashCommand();
	InteractionReact();
} 