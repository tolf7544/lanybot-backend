export type command = "play" | "skip" | "leave" | "list" | 'loop' | "loop_all" | 'loop_single' | "pauseOption" | "shuffle" | "rmdPlaylist" | 'pause' | 'resume' | 'ready' | 'end' | 'start' | 'clear' | 'addMusic' | "preStream"| "showStream" | "nextStream" |"default"
export type loop = "single" | "all" | "noloop" | "system_active"
export type status = "ready" | "start" | "running" | "end" | 'failed'
export type action = "clear_music_service" | "unsafe_url_censor" | 'create_resource' | "connect_voice_channel" | "receive_connection_event"| "receive_player_event" | "skip_command" | "play_music" | "finish_music_service" | "play_music" | "disconnect_voice_channel" | 'react_player_error_event' | 'create_audio_player' | 'generate_dir' | "get_guild_data" | "get_youtubePL_data" | "collect_data" | "send_embed" | "resume_music" | "pause_music" | "pause_music-force" | "caching_client_data" | "skip_overlist_music_number" | "resume_command" | "shuffle_command" | "loop_command" | "pause_command"  | "check_permission" | "check_queue_is_available" | "check_user_connect_voicechannel" | "check_stream_system_is_available" | "check_stream_is_playing" | "list_command" | "leave_command" | "get-active_page_columns_Data" | "get_channelData_from_interaction" | "get_youtube_data" | "preStream_command" | "showStream_command" | "nextStream_command" |"insert_db" | "get_db" | "get_db_connection"

export type trigger = "clientEvent" | "system" | "library" | "VoiceEvent" | "CommandEvent" | "ConnectionEvent"| "PlayerEvent" | "StreamEvent"|"createAudioPlayer"| "fileSystem" | "guild" | 'fetching_youtube_playdata' | "collector" | "showQueueList" | "DataBase"
export interface LogFormat {
	isError: boolean,
	isCommand: boolean,

	message?: string,
	date?: string,
	error?: unknown,

	guildData?: {
		guild: {id:string},
		user: {id:string},
	},
	location?: {
		dir?: string,
		file?: string,
		func?: string,
	},

	service?: {
		serviceType: "music" | "warn" | "censored" | "Mod" | "any"
		Trigger: trigger | [trigger,trigger],
		action: {
			name: action,
			status: status,
		}
		active_loop: loop | undefined
	}

	cmd?: {
		name: command,
		status: status,
	},
}