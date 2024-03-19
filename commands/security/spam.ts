
import { PreviewMessage } from '../../type/type.index';
/** security worker */
import { client } from '../../index';
import SpamDetector from './filter/spam_detector';
import { CommunityServer } from '../../type/type.common';
import { useGuild } from '../../lib/useGuild';

export function execute(previewMessage: PreviewMessage) {

	const server: CommunityServer | undefined = useGuild(previewMessage)
		if(!server) return;

		let filter: SpamDetector
		if(client.spam.has(server.guild.id)) {
			filter = client.spam.get(server.guild.id) as SpamDetector
		} else {
			client.spam.set(server.guild.id,new SpamDetector())
			filter = client.spam.get(server.guild.id) as SpamDetector
		}
		
		filter.add_message_single(server.member.id,previewMessage.contents.content)
}

