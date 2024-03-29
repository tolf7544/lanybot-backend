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
			return input.setName('loop_single')
				.setDescription('loop single')
				.setNameLocalization("ko", "반복재생_하나")
				.setDescriptionLocalization("ko", "재생중인 음악 한곡를 반복재생해요.")
		})
		.addSubcommand((input) => {
			return input.setName('loop_all')
				.setDescription('loop all')
				.setNameLocalization("ko", "반복재생_모두")
				.setDescriptionLocalization("ko", "일시정지된 음악을 다시 재생해요.")
		})
		.addSubcommand((input) => {
			return input.setName('loop_exit')
				.setDescription('loop exit')
				.setNameLocalization("ko", "반복재생_종료")
				.setDescriptionLocalization("ko", "반복재생을 종료해요.")
		})
	,
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
			case "loop_single":
				music_loop("single",interaction)
				break;
			case "loop_all":
				music_loop("all",interaction)
				break;
			case "loop_exit":
				music_loop("false",interaction)
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

async function music_loop(loopState: Queue["loop"],interaction: ChatInputCommandInteraction<CacheType>) {
	const guildId = interaction.guildId
	if (guildId) {
		const music = useMusic(guildId, interaction)
		if (!music) return;

		music.update_user(interaction);
		await music.loop(loopState)
	}
}