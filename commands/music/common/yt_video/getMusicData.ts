/* eslint-disable no-prototype-builtins */
import axios, { AxiosRequestConfig } from "axios";
import { CommunityServer } from "../../../../type/type.common";
import { serverLogger } from "../../../../logManager";
import { Lang } from "../../../../lib/word";
export async function getMusicData(url: any,guild:CommunityServer, option: { hasOwnProperty: (arg0: string) => any; recommendVideo: boolean; category: boolean; videoData: boolean; } | any): Promise<any> {
    // eslint-disable-next-line no-async-promise-executor


        function getChannelData(data: any) {
            const regex = /<script nonce="(.+?)">var ytInitialData = /g;
            const searchStart = (data.match(regex))[0]
            const searchEnd = ';</script>';
            const indexS = data.indexOf(searchStart)

            if (indexS < 0) return null

            let content = data.slice(indexS + searchStart.length);
            const indexE = content.indexOf(searchEnd);
            content = content.slice(0, indexE);
            try {
                const opt = ((res: { hasOwnProperty: (arg0: string) => any; }) => { return res.hasOwnProperty('videoSecondaryInfoRenderer') })

                const channelInfo = JSON.parse(content).contents.twoColumnWatchNextResults.results.results.contents.filter(opt)[0].videoSecondaryInfoRenderer.owner.videoOwnerRenderer

                return {
                    channelThumbnail: channelInfo.thumbnail.thumbnails.pop().url,
                    channelName: channelInfo.title.runs[0].text,
                    channelUrl: 'https://www.youtube.com/channel/' + channelInfo.navigationEndpoint.browseEndpoint.browseId,
                    officialArtist: channelInfo.hasOwnProperty('badges') ? true : false
                }
            } catch (e) {

                return {
                    channelThumbnail: null,
                    channelName: null,
                    channelUrl: null,
                    officialArtist: null
                }
            }
        }

        /********************JSON Parsing********************/

        const JSONParser: any = {

            category: ((data: string | string[]) => {
                try {
                    const searchStart = '"category":"';
                    const searchEnd = '"';

                    const indexS = data.indexOf(searchStart);

                    if (indexS < 0) return `Error`

                    let content = data.slice(indexS + searchStart.length);

                    const indexE = content.indexOf(searchEnd);
                    content = content.slice(0, indexE);

                    return content
                } catch (e) {
                    if (e) {
                        return e
                    }
                }
            }),

            videoData: ((data: any,guild:CommunityServer, opt: string) => {

                try {
                    const channlData = getChannelData(data)
                    const regex = /<script nonce="(.+?)">var ytInitialPlayerResponse =/g;
                    const searchStart = (data.match(regex))[0]
                    const searchEnd = ';</script><div id="player" class="skeleton flexy">';
                    const indexS = data.indexOf(searchStart)

                    if (indexS < 0) return

                    let content = data.slice(indexS + searchStart.length);
                    const indexE = content.indexOf(searchEnd);

                    content = JSON.parse(content.slice(0, indexE))
                    if (opt === `keywords`) {
                        return {
                            keywords: content.videoDetails.hasOwnProperty('keywords') ? content.videoDetails.keywords : channlData?.channelName ? channlData.channelName : null
                        }
                    }
                    return {

                        title: content.videoDetails.title,

                        time: setTime(content.videoDetails.lengthSeconds,guild),

                        timeS: content.videoDetails.lengthSeconds,

                        keywords: content.videoDetails.hasOwnProperty('keywords') ? content.videoDetails.keywords : channlData?.channelName ? [channlData.channelName] : [],

                        description: content.videoDetails.shortDescription.substring(0, 1900),

                        thumbnail: content.videoDetails.thumbnail.thumbnails.pop().url,

                        channelUrl: channlData?.channelUrl,

                        channelName: channlData?.channelName,

                        channelThumbnail: channlData?.channelThumbnail,

                        officialChannel: channlData?.officialArtist,
                    }
                } catch (e) {
                    return {
                        title: null,

                        time: null,

                        timeS: null,

                        keywords: null,

                        description: null,

                        thumbnail: null,

                        channelUrl: null,

                        channelName: null,

                        channelThumbnail: null,

                        officialChannel: null,
                    }
                }
            }),

            recommendVideoData: ((data: any) => {
                const regex = /var ytInitialData =/g;
                const searchStart = (data.match(regex))[0]
                const searchEnd = ';</script>';
                const indexS = data.indexOf(searchStart)
                if (indexS < 0) return { status: 2, category: null, videoData: null, recommendVideoData: null }

                let content = data.slice(indexS + searchStart.length);
                const indexE = content.indexOf(searchEnd);
                content = JSON.parse(content.slice(0, indexE))
                
                const rcVideoData = new Map();

                const videofilter = ((res: { compactPlaylistRenderer: any; compactRadioRenderer: any; compactVideoRenderer: any; }) => { return res.compactPlaylistRenderer !== undefined || res.compactRadioRenderer !== undefined || res.compactVideoRenderer !== undefined })

                try {
                    try {
                        if(content.contents.twoColumnWatchNextResults.results.results.contents[1].videoSecondaryInfoRenderer.metadataRowContainer.metadataRowContainerRenderer.rows) {
                            if(content.contents.twoColumnWatchNextResults.results.results.contents[1].videoSecondaryInfoRenderer.metadataRowContainer.metadataRowContainerRenderer.rows[0].metadataRowRenderer.contents[0].runs[0].text == "연령 제한 동영상(커뮤니티 가이드 기준)")
                             return "ADULT"; 
                        }
                    } catch (e) { /** empty */ }
                    
                let videoList = content.contents.twoColumnWatchNextResults.secondaryResults.secondaryResults.results.filter(videofilter)

                    videoList = videoList.slice(0, -1)
                    videoList = videoList.reverse();

                    videoList.map(function (data: { compactVideoRenderer: { hasOwnProperty: (arg0: string) => any; lengthText: { accessibility: { accessibilityData: { label: string; }; }; simpleText: string; }; shortBylineText: { runs: { navigationEndpoint: { browseEndpoint: { browseId: string; }; }; }[]; }; videoId: string; title: { simpleText: any; }; thumbnail: { thumbnails: { (): any; new(): any; url: any; }[]; }; channelThumbnail: { thumbnails: { (): any; new(): any; url: any; }[]; }; } | any; }) {

                        if (data.compactVideoRenderer !== undefined) {
                            const timeStamp: object | any = {
                                timeNum: 0,
                                timeStr: ``,
                                timeSim: ``
                            };

                            if (!data.compactVideoRenderer.hasOwnProperty(`lengthText`)) {
                                timeStamp.timeNum = 0;
                                timeStamp.timeStr = '실시간 스트리밍중입니다!';
                                timeStamp.timeSim = '∞';
                            } else {

                                timeStamp.timeStr = data.compactVideoRenderer.lengthText.accessibility.accessibilityData.label;

                                // if (timeStamp.timeStr.match(/([0-9]?[0-9])시간/g) !== null) { timeStamp.timeNum += parseInt(timeStamp.timeStr.match(/([0-9]?[0-9])시간/g)[0].replace(`h`)) * 3600; }
                                // if (timeStamp.timeStr.match(/([0-9]?[0-9])분/g) !== null) { timeStamp.timeNum += parseInt(timeStamp.timeStr.match(/([0-9]?[0-9])분/g)[0].replace(`m`)) * 60; }
                                // if (timeStamp.timeStr.match(/([0-9]?[0-9])초/g) !== null) { timeStamp.timeNum += parseInt(timeStamp.timeStr.match(/([0-9]?[0-9])초/g)[0].replace(`s`)); }
                                if (timeStamp.timeStr.match(/([0-9]?[0-9])시간/g) != null) {
                                    timeStamp.timeNum += parseInt(timeStamp.timeStr.match(/([0-9]?[0-9])시간/g)[0].replace(`시간`, ``)) * 3600;
                                    timeStamp.timeStr.replace(`시간`, `hour`);
                                }

                                if (timeStamp.timeStr.match(/([0-9]?[0-9])분/g) != null) {
                                    timeStamp.timeNum += parseInt(timeStamp.timeStr.match(/([0-9]?[0-9])분/g)[0].replace(`분`, ``)) * 60;
                                    timeStamp.timeStr.replace(`분`, `min`);
                                }
                                if (timeStamp.timeStr.match(/([0-9]?[0-9])초/g) != null) {
                                    timeStamp.timeNum += parseInt(timeStamp.timeStr.match(/([0-9]?[0-9])초/g)[0].replace(`초`, ``))
                                    timeStamp.timeStr.replace(`초`, `sec`);
                                }
                                timeStamp.timeSim = data.compactVideoRenderer.lengthText.simpleText;
                            }




                            let description = ``;
                            description = "artist:" + data.compactVideoRenderer.shortBylineText.runs[0].text + " | time[" + timeStamp.timeSim + ']';

                            rcVideoData.set(data.compactVideoRenderer.videoId, {
                                title: data.compactVideoRenderer.title.simpleText,
                                time: timeStamp.timeStr,
                                timeS: timeStamp.timeNum,
                                description: description,
                                videoId: data.compactVideoRenderer.videoId,
                                url: `https://www.youtube.com/watch?v=` + data.compactVideoRenderer.videoId,
                                thumbnail: data.compactVideoRenderer.thumbnail.thumbnails.pop().url,
                                channelName: data.compactVideoRenderer.shortBylineText.runs[0].text,
                                channelUrl: 'https://www.youtube.com/channel/' + data.compactVideoRenderer.shortBylineText.runs[0].navigationEndpoint.browseEndpoint.browseId,
                                channelThumbnail: data.compactVideoRenderer.channelThumbnail.thumbnails.pop().url
                            });

                        }
                    })

                    return rcVideoData

                } catch (e) {
                    const logger = new serverLogger();
                    logger.writeLog({
                        isError: true,
                        isCommand: false,
                        error: e,
                        location: {
                            dir: __dirname,
                            file: __filename,
                            func: "getMuresolvesicData"
                        },
                        service: {
                            serviceType: "music",
                            Trigger: "CommandEvent",
                            action: {
                                name: "get_youtubePL_data",
                                status: "failed",
                            },
                            active_loop: "system_active",
                        }
                    })
                    return null;
                }
            })
        }

        try {
            const YTData = await axios.get(`${url}`, { useragent: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.36 Edg/100.0.1185.29` } as AxiosRequestConfig)

            if (!YTData?.data) {
                console.log(`[error] ${url} is not available`)
                return { category: null, videoData: null, recommendVideoData: null,error:YTData }
            }
            if (isObject(option)) {
                return {
                    id: url.match(/[0-9A-Za-z_-]{10}[048AEIMQUYcgkosw]/g)[0],
                    category: option.hasOwnProperty('category') ? option.category === true ? JSONParser.category(YTData.data) : false : null,
                    videoData: option.hasOwnProperty('videoData') ? option.videoData.hasOwnProperty(`keywords`) ? JSONParser.videoData(YTData.data, 'keywords') : option.videoData === true ? JSONParser.videoData(YTData.data) : false : null,
                    recommendVideoData: option.hasOwnProperty('recommendVideo') ? option.recommendVideo === true ? await Array.from(JSONParser.recommendVideoData(YTData.data)) : false : null,
                    error: null
                }
            } else {
                if(JSONParser.recommendVideoData(YTData.data) == "ADULT") return ({category: null, videoData: null, recommendVideoData: null,error:"ADULT" })
                return {
                    id: url.match(/[0-9A-Za-z_-]{10}[048AEIMQUYcgkosw]/g)[0],
                    category: JSONParser.category(YTData.data),
                    videoData: JSONParser.videoData(YTData.data,guild),
                    recommendVideoData: JSONParser.recommendVideoData(YTData.data),
                    error: null
                }
            }

        } catch (e) {
            if (e) {
                return { category: null, videoData: null, recommendVideoData: null,error:e }
            }
        }

}


function isObject(value: any) {
    if (
        typeof value === 'object' &&
        !Array.isArray(value) &&
        value !== null
    ) {
        return true
    } else {
        return false
    }
}

export function setTime(timeS: string | any,guild:CommunityServer) {
    const lang = new Lang(guild.guild.id)
    let Time = '';
    let Sec = 0;
    let Min = 0;
    if (timeS * 1 < 60) {

        Time = timeS + `${lang.time[0]}`

    } else if (timeS * 1 > 3600) {

        const H = Math.floor(timeS * 1 / 3600)
        Sec = Math.ceil((timeS * 1 - H * 3600) % 60)
        Min = Math.ceil(((timeS * 1 - H * 3600) - Sec) / 60)
        Time = `${H}${lang.time[2]} ${Min}${lang.time[1]} ${Sec}${lang.time[0]}`

    } else if (timeS * 1 > 60) {

        Sec = Math.ceil(timeS * 1 % 60)
        Min = Math.ceil((timeS * 1 - Sec) / 60)
        Time = `${Min}${lang.time[1]} ${Sec}${lang.time[0]}`

    }
    return Time;
}

/**
 * status code
 * success
 * 1
 * url is incorrect 
 * 2
 * data is unavailable
 * 3
 */