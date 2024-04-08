/* eslint-disable @typescript-eslint/no-unused-vars */
import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { useMusic } from './common/music';
import { Queue } from './common/queue';

/* MAIN SOURCECODE */

export = {
	stream: new Map(),

	data: new SlashCommandBuilder()
		.setName('music')
		.setNameLocalization("ko", "음악")
		.setDescription('i manage music.')
		.setDescriptionLocalization("ko", '음악을 관리해요.')
		.addSubcommand((input) => {
			return input.setName("play")
				.setNameLocalization("ko", "재생")
				.setDescription('Play or search for music!')
				.setDescriptionLocalization("ko", '음악를 재생해요.')
				.addStringOption((otpion) => {
					return otpion.setName('input')
						.setNameLocalization("ko", "입력")
						.setDescriptionLocalization("ko", "유튜브 링크 또는 검색할 내용을 입력하세요")
						.setDescription('Enter a YouTube link or search query')
						.setRequired(true)
				}).addStringOption((option) => {
					return option.setName("option")
						.setNameLocalization("ko", "선택")
						.setDescription("you can add play option.")
						.setDescriptionLocalization("ko", "재생 옵션을 추가할수있어요.")
						.addChoices(
							{ name: "play next time", name_localizations: { ko: "다음 순서에 재생하기" }, value: "1" }
						)
				})
		})
		.addSubcommand((input) => {
			return input.setName('skip')
				.setDescription('remove playing music from queue.')
				.setNameLocalization("ko", "스킵")
				.setDescriptionLocalization("ko", "재생중인 음악을 멈추고 대기열에서 없애요.")
				.addIntegerOption(option => {
					return option.setName('number')
						.setNameLocalization("ko", "숫자")
						.setDescription("Enter the number to skip or run it immediately")
						.setDescriptionLocalization("ko", "스킵할 번호를 입력하시거나 바로 실행해주세요.")
				})
		})
		.addSubcommand((input) => {
			return input.setName('queue')
				.setDescription('show queue')
				.setNameLocalization("ko", "대기열")
				.setDescriptionLocalization("ko", "현재 대기열을 보여드려요.")
		})
		.addSubcommand((input) => {
			return input.setName('pause')
				.setDescription('pause the music')
				.setNameLocalization("ko", "일시정지")
				.setDescriptionLocalization("ko", "재생중인 음악을 일시정지해요.")
		})
		.addSubcommand((input) => {
			return input.setName('resume')
				.setDescription('resume the music')
				.setNameLocalization("ko", "일시정지해제")
				.setDescriptionLocalization("ko", "일시정지된 음악을 다시 재생해요.")
		})
		.addSubcommand((input) => {
			return input.setName('clear')
				.setDescription('Reset the queue and disconnect.')
				.setNameLocalization("ko", "초기화")
				.setDescriptionLocalization("ko", "현재 재생목록을 초기화하고 연결을 해제해요.")
		})
		.addSubcommand((input) => {
			return input.setName('shuffle')
				.setDescription('Randomize the order of playlists.')
				.setNameLocalization("ko", "셔플")
				.setDescriptionLocalization("ko", "재생목록의 순서를 랜덤으로 바꿔요.")
		})
        .addSubcommand((input) => {
			return input.setName('loop')
				.setDescription('loop setting')
				.setNameLocalization("ko", "반복재생")
				.setDescriptionLocalization("ko", "반복재생을 설정해요 [하나, 모두, 종료]")
				.addStringOption((option) => {
				return option.setName("option")
					.setNameLocalization("ko", "선택")
					.setDescription("option: [single, all, finish]")
					.setDescriptionLocalization("ko", "선택: [하나, 모두, 종료]")
					.addChoices({ name: "single", name_localizations: { ko: "하나" }, value: "single" }, { name: "all", name_localizations: { ko: "모두" }, value: "all" }, { name: "finish", name_localizations: { ko: "종료" }, value: "false" })
					.setRequired(true);
			});
		})
		.addSubcommand((input) => {
			return input.setName('move')
				.setDescription('Set it to play the previous or next track.')
				.setNameLocalization("ko", "움직이기")
				.setDescriptionLocalization("ko", "이전 음악 또는 다음 음악을 재생하도록 설정해요.")
				.addStringOption((option) => {
					return option.setName("option")
						.setNameLocalization("ko", "선택")
						.setDescription("option: [previous, next]")
						.setDescriptionLocalization("ko", "선택: [이전 음악, 다음 음악]")
						.addChoices(
						{ name: "previous music", name_localizations: { ko: "이전 음악" }, value: "previos" },
						{ name: "next music", name_localizations: { ko: "다음 음악" }, value: "next" },
						)
						.setRequired(true);
				});
		})
		.addSubcommand((input) => {
			return input.setName('information')
				.setDescription('show streaming music information')
				.setNameLocalization("ko", "정보")
				.setDescriptionLocalization("ko", "현재 재생중인 음악 정보를 알려드려요.")
		}),
		
	async execute(interaction: ChatInputCommandInteraction<CacheType>) {
		await interaction.deferReply({ ephemeral: false })
		const SubCommand = interaction.options.getSubcommand();


		switch (SubCommand) {
			case "play":
				music_play(interaction);
				break;
			case "skip":
				music_skip(interaction)
				break;
			case "queue":
				show_queue(interaction)
				break;
			case "pause":
				music_pause(interaction)
				break;
			case "resume":
				music_resume(interaction)
				break;
			case "clear":
				music_clear(interaction)
				break;
			case "loop":
				music_loop(interaction)
				break;
			case "move":
				music_move(interaction)
				break;
			case "information":
				music_info(interaction)
				break;
			case "shuffle":
				music_shuffle(interaction)
				break;
		}
	},
};

async function show_queue(interaction: ChatInputCommandInteraction<CacheType>) {
	const guildId = interaction.guildId
	if (guildId) {
		const music = useMusic(guildId, interaction)
		if (!music) return;

		music.update_user(interaction);
		await music.showQueue()

	}
}

async function music_skip(interaction: ChatInputCommandInteraction<CacheType>) {
	const skipNumber = interaction.options.getInteger("number");

	const guildId = interaction.guildId
	if (guildId) {
		const music = useMusic(guildId, interaction)
		if (!music) return;

		music.update_user(interaction);
		await music.skip(skipNumber)

	}
}

async function music_play(interaction: ChatInputCommandInteraction<CacheType>) {
	const input = interaction.options.getString("input")
	const input2 = interaction.options.getString("option")
	const guildId = interaction.guildId
	if (typeof input == 'string' && guildId) {
		const music = useMusic(guildId, interaction)
		if (!music) return;

		let isNextPlay = false;
		if (input2) {
			if (input2 == "1") isNextPlay = true;
		}
		music.update_user(interaction);
		await music.play(input, isNextPlay)

	}
}

async function music_pause(interaction: ChatInputCommandInteraction<CacheType>) {
	const guildId = interaction.guildId
	if (guildId) {
		const music = useMusic(guildId, interaction)
		if (!music) return;

		music.update_user(interaction);
		await music.pause()
	}
}

async function music_resume(interaction: ChatInputCommandInteraction<CacheType>) {
	const guildId = interaction.guildId
	if (guildId) {
		const music = useMusic(guildId, interaction)
		if (!music) return;

		music.update_user(interaction);
		await music.resume()
	}
}

async function music_clear(interaction: ChatInputCommandInteraction<CacheType>) {
	const guildId = interaction.guildId
	if (guildId) {
		const music = useMusic(guildId, interaction)
		if (!music) return;

		music.update_user(interaction);
		await music.clear()
	}
}

async function music_loop(interaction: ChatInputCommandInteraction<CacheType>) {
	const input = interaction.options.getString("option") as Queue["loop"]
	const guildId = interaction.guildId
	if (guildId) {
		const music = useMusic(guildId, interaction)
		if (!music || !input) return;

	
		music.update_user(interaction);
		await music.loop(input)
	}
}

async function music_move(interaction: ChatInputCommandInteraction<CacheType>) {
	const input = interaction.options.getString("option")
	const guildId = interaction.guildId
	if (guildId) {
		const music = useMusic(guildId, interaction)
		if (!music || !input) return;

	
		music.update_user(interaction);
		
		if(input == "previos") {
			music.previousPlay()
		} else {
			music.nextPlay()
		}
	}
}

async function music_info(interaction: ChatInputCommandInteraction<CacheType>) {
	const guildId = interaction.guildId
	if (guildId) {
		const music = useMusic(guildId, interaction)
		if (!music) return;

		music.update_user(interaction);
		await music.info()
	}
}
async function music_shuffle(interaction: ChatInputCommandInteraction<CacheType>) {
	const guildId = interaction.guildId
	if (guildId) {
		const music = useMusic(guildId, interaction)
		if (!music) return;

		music.update_user(interaction);
		await music.shuffleQueue()
	}
}