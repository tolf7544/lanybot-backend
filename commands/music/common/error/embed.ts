import { EmbedBuilder } from "discord.js";
import { CommunityServer } from "../../../../type/type.common";
import { send_message } from "../../../../lib/sendMessage";
import { client } from "../../../..";
import { ErrorCode } from '../../../../type/type.error';
import { icon } from "../../../../lib/icon";

export function sendEmbed(server:CommunityServer | undefined,code:string,isEphemeral?:boolean):undefined {
	
	if(!isEphemeral) isEphemeral = true
	if(!server) return;
	const embed = errorEmbed(server.guild.id,code)

	if(server.interaction) {
		if(server.interaction.channel) {
			if(server.interaction.isRepliable()) {
				if (server.interaction.replied || server.interaction.deferred) {
					server.interaction.followUp({embeds:[embed()],ephemeral: isEphemeral});
					return
				} else {
					server.interaction.editReply({embeds:[embed()]});
					return
				}
			}
		}
	}
	send_message({input:server,embed:[embed()]})
}

function errorEmbed(guildId:string,code:string) {
	let local: string;
	
		if (client.lang.has(guildId)) {
			const lang = client.lang.get(guildId);
			if (lang == 'en') {
				local = 'en';
			} else {
				local = 'ko';
			}
		} else {
			local = 'ko';
		}
		const res = ErrorCode.filter((_code) => {return _code == code})
		const list = {_0001,_0002,_0101,_0102,_0201,_0202,_0203,_0301,_0302,_0303,_0304,_0401,_0402,_0404,_0405,_0406}
		return list[res[0]]
	// player error

	function _0001() {
		if(local == "en") return getEmbed("playlist cannot be added to queue","Please try with another playlist")
		else return getEmbed("플레이리스트 대기열에 추가할수없어요","다른 플레이리스트로 시도해주세요!")
	}

	function _0002() {
		if(local == "en") return getEmbed("The playlist cannot be loaded","")
		else return getEmbed("플레이리스트를 불러올수 없어요.","입력된 한곡만 추가돼요.")
	}

	function _0101() {
		if(local == "en") return getEmbed("","")
		else return getEmbed("메시지를 보내는데 실패하였어요","잠시 후 다시 시도해주세요.")
	}
	function _0102() {
		if(local == "en") return getEmbed("","")
		else return getEmbed("디스코드에 오류가 발생했어요","잠시 후 다시 시도해주세요.")
	}
	function _0201() {
		if(local == "en") return getEmbed("","")
		else return getEmbed("알수없는 오류가 발생헀어요","잠시 후 다시 시도해주세요.")
	}
	function _0202() {
		if(local == "en") return getEmbed("","")
		else return getEmbed("디스코드에 문제가 발생헀어요.","잠시 후 다시 시도해주세요.")
	}
	function _0203() {
		if(local == "en") return getEmbed("","")
		else return getEmbed("알수없는 오류가 발생했어요","잠시 후 다시 시도해주세요.")
	}
	function _0301() {
		if(local == "en") return getEmbed("","")
		else return getEmbed("사용자 정보를 가져오는데 실패하였습니다.","디스코드에 문제가 발생한 것이니 잠시 후 다시 시도해주세요/")
	}
	function _0302() {
		if(local == "en") return getEmbed("The queue is empty.","")
		else return getEmbed("사용자가 참여한 음성 채널을 볼수없어요..","권한을 확인하거나 잠시 후 다시 시도 해주세요.")
	}
	function _0303() {
		if(local == "en") return getEmbed("The queue is empty.","")
		else return getEmbed("통화방에 참가한 후 이용해주세요!","기다릴게요!")
	}
	function _0304() {
		if(local == "en") return getEmbed("","")
		else return getEmbed("레니를 이용하기 위한 권한이 부족해요.","해당 채널에 \"연결할수있는 권한\"과 \"말할수있는 권한\"이 있는지 확인해주세요.")
	}
	function _0401() {
		if(local == "en") return getEmbed("","")
		else return getEmbed("현재 대기열이 비어있어요.","\"/재생\"을 통해 음악을 추가하고 이용할수있어요!")
	}
	function _0402() {
		if(local == "en") return getEmbed("","")
		else return getEmbed("음성 채널 정보가 누락되었습니다.","(\"\\초기화\"를 진행하는 것을 추천할게요.)")
	}

	function _0404() {
		if(local == "en") return getEmbed("","")
		else return getEmbed("음악이 재생중일때에만 사용할수있어요.","음악을 재생 후 사용해주세요!")
	}
	function _0405() {
		if(local == "en") return getEmbed("","")
		else return getEmbed("현재 음악을 준비하는중입니다!","명령어를 천천히 사용해주세요.")
	}
	function _0406() {
		if(local == "en") return getEmbed("","")
		else return getEmbed("성인인증이 필요한 음악을 요청하셨어요!","연령제한 영상은 재생할수없습니다.")
	}


	function getEmbed(title: string, des: string): EmbedBuilder {
		const embed = new EmbedBuilder()
			.setAuthor({ iconURL:icon.warn,name: title })
			.setColor("Red")
		if(des.length > 1) {
			embed.setDescription(des)
		}
		return embed;
	}
}