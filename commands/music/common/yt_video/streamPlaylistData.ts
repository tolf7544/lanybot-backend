/* eslint-disable no-async-promise-executor */
/* eslint-disable no-useless-escape */
import axios from 'axios'
import { LogFormat } from '../../../../type/type.log';

export type videoId = string;
export type title = string;
export type time = string;

export type queueItem = [videoId,title,time];
export type playlist = Array<queueItem>
export function getPlaylist(url: string): Promise<queueItem[]> {
    return new Promise(async (resolve, reject: (error: LogFormat) => void) => {


        const playlistData = ((data: any):queueItem[] => {

            const regex = 'var ytInitialData = ';
            const searchStart = (data.match(regex))[0]
            const searchEnd = ';</script>';
            const indexS = data.indexOf(searchStart)
            const playlist: queueItem[] = [];

            try {
                if (indexS < 0) return []

                let content = data.slice(indexS + searchStart.length);
                const indexE = content.indexOf(searchEnd);

                content = JSON.parse(content.slice(0, indexE))

                if(content.contents.twoColumnBrowseResultsRenderer) {
                    try {
                        content = content.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].playlistVideoListRenderer.contents
                    } catch (e) {
                        content = content.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.richGridRenderer.contents
                    }

                    for (let i = 0; i < content.length; i++) {
                        const videoData = content[i].playlistVideoRenderer
                        playlist.push([videoData.videoId,videoData.title.simpleText,videoData.lengthText.simpleText])
                    }
                } else if(content.contents.twoColumnWatchNextResults){
                    content = content.contents.twoColumnWatchNextResults.playlist.playlist.contents
                   
                    for (let i = 0; i < content.length; i++) {
                        const videoData = content[i].playlistPanelVideoRenderer
                        if(!videoData.title) {
                            playlist.push([videoData.videoId,"undefined","undefined"])
                        } else {
                            playlist.push([videoData.videoId,videoData.title.simpleText,videoData.lengthText.simpleText])
                        }
                    }
                }



                return playlist

            } catch (e) {
                return playlist
            }
        })

        try {
            if (url.indexOf('playlist?list=') > 0) {
                matchToString(/[?&]list=([^#\&\?]+)/g, url).then((id) => {
                    url = 'https://www.youtube.com/playlist?list=' + id.replace(/[?&]list=/g, '');

                    parser(url);
                }).catch(() => {
                    return reject(error_logger(` catched error(return reject):line:63(on typescript)\n module rejected:line:68(on typescript)\n[issue] playlist id doesn't found in url  by regex\nURL -> ${url}`))
                })
            } else if (url.match(/[0-9A-Za-z_-]{10}[048AEIMQUYcgkosw]/g)) {
                matchToString(/[?&]list=([^#\&\?]+)/g, url).then((id) => {
                    const vid = url.match(/[0-9A-Za-z_-]{10}[048AEIMQUYcgkosw]/g);
                    if(!vid) return reject(error_logger(` const vid is null(return reject):line:71(on typescript)\n module rejected:line:74(on typescript)\n[issue] video id doesn't found in url included playlist id by regex\nURL -> ${url}`))

                    url = `https://www.youtube.com/watch?v=${vid[0]}&list=${id.replace(/[?&]list=/g, '')}&start_radio=1`;
                    parser(url);
                }).catch(() => {
                    return reject(error_logger(` catched error(return reject):line:71(on typescript)\n module rejected:line:78(on typescript)\n[issue] playlist id doesn't found in url included video id  by regex\nURL -> ${url}`))
                })
            } else {
                return reject(error_logger(` url can't specificed :line:70 && 62 (on typescript)\n module rejected:line:81(on typescript)\n[issue] url format is not matched \nURL -> ${url}`))
            }
        } catch (e) {
            return reject(error_logger(` catched error :line:83(on typescript)\n module rejected:line:84(on typescript)\n[issue] see .error property  \nURL -> ${url}`,e))
        }


    function parser(url:string) {
        axios.get(`${url}`, { httpAgent: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.36 Edg/100.0.1185.29`}).then((ytData) => {
            const playlistIdList: queueItem[] = playlistData(ytData.data);

            return resolve(playlistIdList);
        }).catch((e) => {
            return reject(error_logger(` catched error :line:89(on typescript)\n module rejected:line:93(on typescript)\n[issue] axios returned error  \nURL -> ${url}`,e))
        })
    }
    function error_logger(_message: string,e?: unknown):LogFormat {
        return {
            isError: true,
            isCommand: true,
            message: _message,
            error: e,
            location: {
                dir: __dirname,
                file: __filename,
                func: "getPlaylist"
            },
            service: {
                serviceType: "music",
                Trigger: "fetching_youtube_playdata",
                action: {
                    name: 'get_youtubePL_data',
                    status: 'failed',
                },
                active_loop: "system_active",
            },
            cmd: {
                name: "play",
                status: "running",
            }
         }
    }
})
}


function matchToString(regex:RegExp,text:string):Promise<string> {
	return new Promise<string>((resolve:(value: string) => void, reject: (error: null) => void) => {
		const id = text.match(regex);

		if(id) {
			if(id[0]) {
				return resolve(id[0]);
			} else {
				return reject(null);
			}
		} else {
			return reject(null);
		}
	})
}