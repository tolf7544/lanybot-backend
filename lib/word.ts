import { client } from "..";


export const ERROR = {
	DISCORD: 'DISCORD_LANY_BOT_DISCORD_API_ISSUE',
	BOT: 'DISCORD_LANY_BOT_LIBRARY_ISSUE',
	UNKNOWN: 'DISCORD_LANY_BOT_UNKNOWN_ISSUE',
}


export class Lang {
	local: string;

	constructor(guildId: string) {
		if (client.lang.has(guildId)) {
			const lang = client.lang.get(guildId);
			if (lang == 'en') {
				this.local = 'en';
			} else {
				this.local = 'ko';
			}
		} else {
			this.local = 'ko';
		}
	}
	
	get errorMissingTextChannelPermission_Title() {
		if (this.local == 'en') return 'The call room cannot be connected due to missing permissions to use the command.'
		else return '현재 명령어를 사용하신 통화방 및 챗팅방에 권한이 부족하여 사용할수없습니다.'
	}

	get errorMissingTextChannelPermission_Description() {
		if (this.local == 'en') return 'Please try again by granting the necessary permissions for connection and speech!'
		else return '연결 및 말하기 권한 또는 메시지 보내기 및 보기 권한을 적용시켜서 다시 시도해주세요!'
	}

	get time() {
		if (this.local == 'en') return ["sec","min","hour"]
		else return ["초","분","시"]
	}

	get searchActiveEmbed_Title() {
		if (this.local == 'en') return 'Choose the music you want!'
		else return '원하는 음악를 선택해주세요!'
	}
			
		
	get searchActiveEmbed_Description() {
		if (this.local == 'en') return ['keyword:','Ends in 60 sec']
		else return ['검색어: ','60초뒤 종료됩니다']
	}

	get searchSuccess_Title() {
		if (this.local == 'en') return 'successfully selected.'
		else return '성공적으로 선택되었습니다.'
	}
			
		
	get searchSuccess_Description() {
		if (this.local == 'en') return ['title','artist']
		else return ['제목','아티스트']
	}
	get playEmbedSelectQueue_Title() {
		if (this.local == 'en') return 'Please choose the music you would like to add'
		else return '추가하고싶은 음악을 선택해주세요'
	}
	get searchCancel_Title() {
		if (this.local == 'en') return 'finish'
		else return '검색 종료하기'
	}
	get errorCantUseQuery_Title() {
		if (this.local == 'en') return 'This search keyword is unavailable. (error)'
		else return "해당 검색어는 사용할수없습니다. (오류)"
	}
	get errorCantUseQuery_Description() {
		if (this.local == 'en') return 'Please try another search keyword!'
		else return '다른 검색어를 이용해주세요!'
	}
	get noExistSearchedData_Title() {
		if (this.local == 'en') return 'There are no search results.'
		else return "해당 검색어의 결과를 찾을 수 없습니다."
	}

	get notExistSearchedData_Description() {
		if (this.local == 'en') return 'Please try another search keyword!'
		else return "다른 검색어를 이용해주세요!"
	}
	get errorDiscordMsgApi_Title() {
		if (this.local == 'en') return 'The connection to the Discord API is unstable.'
		else return '현재 디스코드 api와의 연결이 불안정합니다.'
	}

	get errorDiscordMsgApi_Description() {
		if (this.local == 'en') return 'Try again later!'
		else return '잠시 후 다시 시도 해주세요!'
	}
	get errorCantSearchThisQuery_Title() {
		if (this.local == 'en') return 'An error occurred during search.'
		else return '검색을 진행하던 도중 오류가 발생했습니다.'
	}

	get errorCantSearchThisQuery_Description() {
		if (this.local == 'en') return 'Please search something else or try later'
		else return '잠시 후 다시 시도 해주시거나 다른 검색어를 입력해주세요!'
	}
	get errorSearchUnknown_Title() {
		if (this.local == 'en') return 'command is not available at this time'
		else return "현재 명령어를 이용하실수없습니다."
	}
	get searchFinished_Title() {
		if (this.local == 'en') return 'Search ended abnormally.'
		else return "검색이 비정상적으로 종료되었습니다."
	}
	get checkDoesPlaylistAdd_Title() {
		if (this.local == 'en') return ['Would you like to add the playlist with total','music contained?']
		else return ['현재 음악 총','개가 포함된 재생목록을 추가하시겠습니까?']
	}
	get checkDoesPlaylistAdd_Description() {
		if (this.local == 'en') return 'If you cancel, the music entered with the playlist or the first song in the playlist will be played.'
		else return '만약 취소하신다면 재생목록과 함께 입력된 음악이나 재생목록의 첫번째 음악을 재생합니다.'
	}
	get errorSearchFinished_Title() {
		if (this.local == 'en') return 'Search ended!'
		else return "검색이 종료되었습니다!"
	}
	get checkDoesPlaylistAddTrue_Title() {
		if (this.local == 'en') return 'playlist added queue.'
		else return "플레이리스트가 추가되었습니다."
	}
	get checkDoesPlaylistAddFalse_Title() {
		if (this.local == 'en') return 'Only one song from the playlist will be added'
		else return '재생목록에서 한곡만 추가됩니다!'
	}
	get checkDoesPlaylistAddButton_Title() {
		if (this.local == 'en') return 'add'
		else return '추가하기'
	}

	get checkDoesPlaylistCancelButton_Title() {
		if (this.local == 'en') return 'cancel'
		else return '취소하기'
	}

	get showQueueButton_Title() {
		if (this.local == 'en') return ['previous page','next page', 'cancel']
		else return ['이전 페이지','다음 페이지','취소하기']
	}

	get showpQueue_Title() {
		if (this.local == 'en') return 'Playing music'
		else return '플레이리스트'
	}

	get addEmbed_Title() {
		if (this.local == 'en') return 'Added to your playlist.'
		else return '대기열에 추가되었습니다.'
	}

	get addEmbed_Description() {
		if (this.local == 'en') return ['Playtime','queue number']
		else return ['재생시간','대기열 번호']
	}
	get resume_Title() {
		if (this.local == 'en') return 'Unpause the music.'
		else return '일시정지를 해제합니다.'
	}

	get skip_Title() {
		if (this.local == 'en') return 'the music skipped'
		else return '스킵되었습니다.'
	}
				
		
	get pause_Title() {
		if (this.local == 'en') return 'Pause music.'
		else return "음악이 일시정지되었습니다."
	}

	get end_Title() {
		if (this.local == 'en') return 'All music played.'
		else return '모든 음악이 재생되었습니다.'
	}		
		
	get shuffle_Title() {
		if (this.local == 'en') return ['A total of',' songs have been shuffled.','The shuffle succeeded.']
		else return ['외','곡의 음악이 셔플되었습니다','셔플에 성공하였습니다']
	}

	get loopSingle_Title() {
		if (this.local == 'en') return 'loop the currently playing music.'
		else return '현재 재생중인 음악을 반복재생합니다.'
	}
				
		
	get loopAll_Title() {
		if (this.local == 'en') return 'loop all the music in the queue'
		else return '대기열에 있는 모든 음악을 반복재생합니다.'
	}

	get loopAll_Description() {
		if (this.local == 'en') return 'All queue'
		else return "전체 대기열"
	}
	
		
	get loopFooter_Title() {
		if (this.local == 'en') return 'Once loop starts, i\'ll not send any more messages until loop is ended!'
		else return '반복재생을 시작하면 해제 될 때까지 더 이상 메시지를 보내지 않습니다!'
	}

	get loopExit_Title() {
		if (this.local == 'en') return 'Stop loop.'
		else return "반복재생을 종료합니다!"
	}
					
		
	get loopExitFooter_Title() {
		if (this.local == 'en') return 'From now on, the music will play without loop!'
		else return "이제부터 정상적으로 음악이 재생됩니다!"
	}

	get loop_Description() {
		if (this.local == 'en') return 'Loop:'
		else return '반복재생:'
	}

	get errorPlayEmbedUnknown_Title() {
		if (this.local == 'en') return 'An unknown error has occured'
		else return "알수없는 오류가 발생했어요."
	}
		
		
	get errorPlayEmbedUnknown_Description() {
		if (this.local == 'en') return 'The music will be played, but the system message won\'t be sent'
		else return "음악는 재생되지만 메시지를 전송할수없습니다."
	}
		
	get playEmbed_Title() {
		if (this.local == 'en') return 'Start playing!'
		else return '음악을 재생합니다!'
	}

	get playEmbed_Description() {
		if (this.local == 'en') return ['Playtime','queue length']
		else return ['재생시간','대기중인 음악 갯수']
	}
	get clearSystemMsg_embedE_Title() {
		if (this.local == 'en') return 'Music ended unsteadily.'
		else return `음악이 불안정하게 끝났습니다.`
	}

	get clearSystemMsg_embedE_Description() {
		if (this.local == 'en') return ['Played music is','']
		else return ['재생된 음악는','입니다.']
	}

	get clearSystemMsg_embedE1_Title() {
		if (this.local == 'en') return 'You cannot play the video because it is prohibited from playing in us-west.'
		else return `\`us-west\`에서 재생이 금지된 영상이므로 재생할 수 없습니다.`
	}



	get clearSystemMsg_embedE_Footer() {
		if (this.local == 'en') return ['If you want to hear it again, please search by title or','']
		else return ['만약 다시 듣고싶으면 제목이나','로 검색해주세요!.']
	}
	
	get clearSystemMsg_embed_Title() {
		if (this.local == 'en') return 'Music is over.'
		else return '음악이 끝났습니다.'
	}

	get clearSystemMsg_embedLoop_Title() {
		if (this.local == 'en') return 'Replaying the playlist from now on!'
		else return `이제부터 반복재생이 시작됩니다!`
	}
	get nextStream_title() {
		if (this.local == 'en') return "Play next song."
		else return "다음 음악을 재생합니다"
	}
	get nextStream_title2() {
		if (this.local == 'en') return "The command cannot be executed as this music is the last in the queue."
		else return "해당 음악이 대기열의 마지막 음악이므로 명령어를 실행할수없습니다."
	}
	get clearSystemMsg_Description() {
		if (this.local == 'en') return 'title'
		else return '제목'
	}
	get clear_queue_title() {
		if (this.local == 'en') return 'removed all queue.'
		else return "대기열을 초기화하였습니다."
	}
	get preStream_title() {
		if (this.local == 'en') return "play music that was in previous queue."
		else return "이전 대기열에 있던 음악을 재생합니다"
	}
	get preStream_title2() {
		if (this.local == 'en') return "The command cannot be executed as this music is the first in the queue."
		else return "해당 음악이 대기열의 첫번째 음악이므로 명령어를 실행할수없습니다."
	}

	showStream_des(time1:string,time2:string) {
		if (this.local == 'en') return `${time2} out of ${time1} has been played.`
		else return `${time1} 중 ${time2} 재생되었습니다.`
	}
	get showStream_title() {
		if (this.local == 'en') return "playing music"
		else return "재생중인 음악"
	}
}/*******************************************************************************************/