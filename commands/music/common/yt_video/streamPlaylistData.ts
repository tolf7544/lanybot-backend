/* eslint-disable no-async-promise-executor */
/* eslint-disable no-useless-escape */
import axios from 'axios'
import { LogFormat } from '../../../../type/type.log';

export type videoId = string;
export type title = string;
export type time = string;

export type queueItem = [videoId,title,time];
export type playlist = Array<queueItem>
export function getPlaylist(id: string): Promise<queueItem[]> {
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
                        const title = videoData.title.simpleText? videoData.title.simpleText : videoData.title.runs[0].text
                        playlist.push([videoData.videoId,title,videoData.lengthText.simpleText])
                    }
                } else if(content.contents.twoColumnWatchNextResults){
                    content = content.contents.twoColumnWatchNextResults.playlist.playlist.contents
                   
                    for (let i = 0; i < content.length; i++) {
                        const videoData = content[i].playlistVideoRenderer
                        const title = videoData.title.simpleText? videoData.title.simpleText : videoData.title.runs[0].text
   
                        playlist.push([videoData.videoId,title,videoData.lengthText.simpleText])
           
                    }
                }
                return playlist

            } catch (e) {
                return playlist
            }
        })

        try {
            const url = 'https://www.youtube.com/playlist?list=' + id;

            parser(url);
        } catch (e) {
            return reject(error_logger(` catched error :line:83(on typescript)\n module rejected:line:84(on typescript)\n[issue] see .error property  \nURL -> ${id}`,e))
        }


    function parser(url:string) {
        axios.get(`${url}`, { httpAgent: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.36 Edg/100.0.1185.29`}).then((ytData) => {
            const playlistIdList: queueItem[] = playlistData(ytData.data);
           
            return resolve(playlistIdList);
        }).catch((e) => {
            return reject(error_logger(` catched error :line:89(on typescript)\n module rejected:line:93(on typescript)\n[issue] axios returned error  \nURL -> ${id}`,e))
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
