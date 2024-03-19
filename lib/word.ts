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
}/*******************************************************************************************/