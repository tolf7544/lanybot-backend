import { Collection } from "discord.js";
import { client, messageReact } from "..";

export default function spam() {
	client.spam = new Collection();

	messageReact()
} 