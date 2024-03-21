import { Collection } from "discord.js";
import { client } from "..";

export default function musicStream() {
	client.streamQueue = new Collection();
} 