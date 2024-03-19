// eslint-disable-next-line @typescript-eslint/no-var-requires
const { token } = require('./config.json');
import { Events, GatewayIntentBits, ActivityType, Collection, ClientUser } from 'discord.js';

import { Client } from 'discord.js';
import { EventEmitter } from 'events';
import { ProcessCollectorValue, VersionMessageCommandType } from './type/type.index';
import VersionManager from './process/versionManager';
import cluster from 'cluster';
import SpamDetector from './commands/security/filter/spam_detector';
import path from 'path';
import fs from 'fs';
import { Music } from './commands/music/common/music';
import "./process/event/masterPCevent.index";
import "./process/event/childPCevent.index";
import "./process/event/childPCevent.message";
import "./process/event/childPCevent.musicStream";
import music from './process/musicStream.music';
import spam from './process/security.spam';
declare module "discord.js" {
	export interface Client {
		commands: Collection<unknown, unknown>
		cooldowns: Collection<unknown, unknown>
		version: Collection<string, string>
		spam: Collection<string, SpamDetector>
		previous_version_guilds:Set<string>
		music: Collection<string,Music>
		lang: Collection<string, string>
		process: Collection<string, ProcessCollectorValue>
		COOLDOWN_SECONDS: number,
		VM: VersionManager,
		is_shutdown: boolean,
	}
}

export const client: Client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.MessageContent,
	],
});

export const ROLE: Array<string|boolean> = [];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
client.previous_version_guilds = new Set();
client.lang = new Collection(); 
client.login(token);

if (cluster.isPrimary) {
	client.process = new Collection();
	client.cooldowns = new Collection();
	client.COOLDOWN_SECONDS = 1;


	client.once(Events.ClientReady, () => {
		const emitter = new EventEmitter();
		emitter.setMaxListeners(0);
		(client.user as ClientUser).setPresence({ activities: [{ name: "LanY", type: ActivityType.Listening }] });

		client.VM = new VersionManager(client)

		client.VM.VersionUpdator()
	});

	client.on(Events.MessageCreate, async (message) => {
		for(const type of VersionMessageCommandType) {

			const process = client.VM.useProcess(type, message.author.id)
			process.then((process) => {
				if(process) {
					process.worker.send(
						JSON.stringify({
							guild: message.guild,
							user: message.author,
							member: message.member,
							channel: message.channel,
							contents: {
								content: message.content,
								id: message.id
							},
							type: "message",
							path: process.path
						})
					)
				}
			})
		}
	})
} else {
	client.on(Events.ClientReady, () => {
		setTimeout(() => {
			if (ROLE.length == 0 || typeof ROLE[0] != "string") {
				return process.exit();
			} else {
				switch (ROLE[0]) {
					case "music":
						music();
						break;
					case "spam":
						spam()
						break;
				}
			}
		}, 1000 * 3);
	})

}

export function debugging(message: any) {
	console.log("-------------------------------------------")
	console.log(message)
	console.log("-------------------------------------------")
} 

export const AddSlashCommand = () => {
	const emitter = new EventEmitter();
	emitter.setMaxListeners(0);
		if(ROLE[1] == true) {
			const foldersPath = path.join(__dirname, 'commands/'+ROLE[0]);
			const commandFiles = fs.readdirSync(foldersPath);
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			for (const file of commandFiles.filter((file: string) => file.endsWith('.js'))) {
				
					// eslint-disable-next-line @typescript-eslint/no-var-requires
					const command = require(foldersPath+ "/" + file);
	
					if ('data' in command && 'execute' in command) {
						client.commands.set(command.data.name, command);
					} else {
						console.log(`[WARNING] The command at ${foldersPath+ "/" + file} is missing a required "data" or "execute" property.`);
					}
			}
		}
}

export const InteractionReact = () => {
	client.on(Events.InteractionCreate, async (interaction) => {
		if (!interaction.isCommand()) return;
		console.log(client.previous_version_guilds)
		if(client.previous_version_guilds.has(interaction.guildId as string )) {
			debugging(JSON.stringify({
				"message":"previos user passing",
				"type": "client.on"
			}))
			return;
		}

		if(client.is_shutdown == true) {
			if(!client.music.has(interaction.guildId as string)) { return; }
		}

		if(client.commands.has(interaction.commandName)) {
			const command:any = client.commands.get(interaction.commandName)
			command.execute(interaction);
		}
	});
}