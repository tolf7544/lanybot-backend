
import { client } from '../../index';
import SpamDetector from './filter/spam_detector';
import { CommunityServer } from '../../type/type.common';
import { useGuild } from '../../lib/useGuild';
import { Message } from 'discord.js';

export function execute(Message: Message<boolean>) {

	const server: CommunityServer | undefined = useGuild(Message)
		if(!server) return;

		let filter: SpamDetector
		if(client.spam.has(server.guild.id)) {
			filter = client.spam.get(server.guild.id) as SpamDetector
		} else {
			client.spam.set(server.guild.id,new SpamDetector())
			filter = client.spam.get(server.guild.id) as SpamDetector
		}
		
		filter.add_message_single(server.member.id,Message.content)
}