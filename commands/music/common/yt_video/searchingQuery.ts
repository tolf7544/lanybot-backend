/* eslint-disable no-prototype-builtins */
/* eslint-disable no-async-promise-executor */
import axios,{AxiosRequestConfig} from 'axios'

/**
 * 
 * 로거 적용하여 에러 저장
 * 
 */
export interface recomendMusicData {
        title: string,
        description:string,
        id: string,
        url: string,
        TimeS: number,
        Time: string,
        channelName:string,
        channelUrl:string,
        thumbnail:string,
        channelThumbnail: string,
}

export {
    Search
}


async function Search(q:string):Promise<Map<string,recomendMusicData>> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
        const url = 'https://www.youtube.com/results?search_query=';

        //const setString = setLang(q); /** music/음악 키워드가 붙은 검색어 */

        q = encodeURI(q)
        try {
            /*
            GetData(url + setString).then((dataArr) => { /** music 키워드를 붙인 후 검색한 결과 */
/*
                addVideosMap(dataArr).then((dataMap) => { 
                    searchedMap.k = dataMap
                    if (searchedMap.nonK?.size > 2) {
                       return resolve(searchedMap)
                    };
                }).catch((e) => {
                    reject(e);
                });

            }).catch((e) => {
                reject(e);
            });
*/
            setTimeout(() => {
                reject('timeout');
            }, 5000);

            GetData(url + q).then((dataArr:unknown[]) => {

                addVideosMap(dataArr).then((dataArr:Map<string,recomendMusicData>) => {
                    return resolve(dataArr);
                }).catch((res) => {reject(res);});
            }).catch((e) => {
                reject(e);
            });

        } catch (e) {
            reject(e);
        }
    });
}

/**
 * 현재 명령어 구동시 1번당 70mb 차지함 (최적화 하기전까지 적용 x 서버 터질 가능성있음)
 * 
 * 최대 30으로 조정 시도
 * 
 * 현재 음악 필터링 기능은 존재않할시에는 7mb 차지
 * 
 */

function GetData(Url:string):Promise<unknown[]> {
    return new Promise( async (resolve, reject) => {
        const yt_res = await axios.get(`${Url}`, { useragent: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.80 Safari/537.36` } as AxiosRequestConfig);

        const YTbody:string = yt_res.data

        const searchStart = 'var ytInitialData =';
        const searchEnd = ';</script>';
        const indexS = YTbody.indexOf(searchStart);
        if (indexS < 0) return `Error`
        let content:any = YTbody.slice(indexS + searchStart.length);
        const indexE = content.indexOf(searchEnd);
        content = content.slice(0, indexE);
  
        content = await JSON.parse(content)

        try {

            const contents = content.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents

            const contentsArr:unknown[] = contents[0].itemSectionRenderer.contents[0].hasOwnProperty(`promotedSparklesWebRenderer`) ? contents[1].itemSectionRenderer.contents : contents[0].itemSectionRenderer.contents;

            // const a = Math.floor(contentsArr.length / 3);

            // const b = contentsArr.length / a;

            // const count = {
            //     eCounts: Math.floor(contentsArr.length / 3),
            //     count: 0,
            //     allC: 0
            // }

            // const Arr = {
            //     f: [],
            //     s: [],
            //     t: []
            // }

            return resolve(contentsArr);

            // const musicArr = [];

            // for (data of contentsArr) {

            //     if (data.hasOwnProperty(`videoRenderer`)) {
            //         count.count += 1;

            //         if (count.count <= count.eCounts) {
            //             Arr.f.push(data)
            //         } else if (count.count <= count.eCounts * 2) {
            //             Arr.s.push(data)
            //         } else {
            //             Arr.t.push(data)
            //         };
            //     };
            // };

            // Arr.f.forEach(data => {

            //     musicFilter(data.videoRenderer.videoId, ((res) => {
            //         count.allC += 1;
            //         res == true ?
            //             musicArr.push(data) : null;
            //         if (count.count === count.allC) {
            //             resolve(musicArr);
            //         }
            //     }));
            // })

            // Arr.s.forEach(data => {

            //     musicFilter(data.videoRenderer.videoId, ((res) => {
            //         count.allC += 1;
            //         res == true ?
            //             musicArr.push(data) : null;
            //         if (count.count === count.allC) {
            //             resolve(musicArr);
            //         }
            //     }));
            // })

            // Arr.t.forEach(data => {

            //     musicFilter(data.videoRenderer.videoId, ((res) => {
            //         count.allC += 1;
            //         res == true ?
            //             musicArr.push(data) : null;
            //         if (count.count === count.allC) {
            //             resolve(musicArr);
            //         }
            //     }));
            // })

        } catch (e) {
            return reject(e);
        }
    })
}



// async function musicFilter(id: any, getData: (arg0: boolean) => any) {
//     const search = require(`./getMusicData.js`);

//     try {
//         const data = await search(`https://youtu.be/${id}&hl=ko`, { category: true })

//         if (data.category == `Music`) {
//             return await getData(true)
//         }
//         return await getData(false)
//     } catch (e) {
//         console.log(e)
//         await getData(false)
//     }

// }

function addVideosMap(dataArr:any[]):Promise<Map<string,recomendMusicData>> {
    return new Promise((resolve, reject) => {
        const videos:Map<string,recomendMusicData> = new Map();
        try {

            for (const data of dataArr) {
                if (data.hasOwnProperty(`videoRenderer`)) {
                    const timeStamp = {
                        timeNum: 0,
                        timeStr: '',
                    }

                    if (!data?.hasOwnProperty(`videoRenderer`) ? true : !data.videoRenderer.hasOwnProperty(`lengthText`) ? true : false) {
                        timeStamp.timeNum = 0;
                        timeStamp.timeStr = '실시간 스트리밍중입니다'
                        continue;
                    } else {

                        const timeString = data.videoRenderer.lengthText.accessibility.accessibilityData.label

                        if (timeString.match(/([0-9]?[0-9])시간/g) != null) {
                            timeStamp.timeNum += parseInt(timeString.match(/([0-9]?[0-9])시간/g)[0].replace(`시간`, ``)) * 3600;
                            timeStamp.timeStr.replace(`시간`, `hour`);
                        }

                        if (timeString.match(/([0-9]?[0-9])분/g) != null) {
                            timeStamp.timeNum += parseInt(timeString.match(/([0-9]?[0-9])분/g)[0].replace(`분`, ``)) * 60;
                            timeStamp.timeStr.replace(`분`, `min`);
                        }
                        if (timeString.match(/([0-9]?[0-9])초/g) != null) {
                            timeStamp.timeNum += parseInt(timeString.match(/([0-9]?[0-9])초/g)[0].replace(`초`, ``))
                            timeStamp.timeStr.replace(`초`, `sec`);
                        }
                    timeStamp.timeStr = data.videoRenderer.lengthText.accessibility.accessibilityData.label
                }

                let description = '';

                if (data.videoRenderer.hasOwnProperty(`detailedMetadataSnippets`)) {
                    if (data.videoRenderer.detailedMetadataSnippets[0].snippetText.runs[0].text == '0:00 -') {
                        description = `artist: "${data.videoRenderer.ownerText.runs[0].text}"`
                        } else {
                            description = data.videoRenderer.detailedMetadataSnippets[0].snippetText.runs[0].text
                        }
                    } else {
                        description = `artist: "${data.videoRenderer.ownerText.runs[0].text}"`
                    }

                    videos.set(data.videoRenderer.videoId, {
                        title: data.videoRenderer.title?.runs[0].text.substring(0, 100),
                        description: description.substring(0, 1900),
                        id: data.videoRenderer.videoId,
                        url: `https://www.youtube.com/watch?v=` + data.videoRenderer.videoId,
                        TimeS: timeStamp.timeNum,
                        Time: timeStamp.timeStr,
                        channelName: data.videoRenderer.ownerText.runs[0].text,
                        channelUrl: `https://www.youtube.com` + data.videoRenderer.ownerText.runs[0].navigationEndpoint.browseEndpoint.canonicalBaseUrl,
                        thumbnail: data.videoRenderer.thumbnail.thumbnails.pop().url,
                        channelThumbnail: data.videoRenderer.channelThumbnailSupportedRenderers.channelThumbnailWithLinkRenderer.thumbnail.thumbnails[0].url,
                    })
                 }// else if(data.hasOwnProperty(`radioRenderer`)){
                    
                // }
            }
            resolve(videos)

        } catch (error) {
            reject(error)
        }
    })
}



                    /**
                     * 
                     * 
                     * 
                     * 
                     * 
                     * 
                     * 
radioRenderer: {
    playlistId: 'RD8o-JZBljd2g',
    title: { simpleText: 'Mix - BUBBLE TEA (feat. Juu & Cinders)' },
    thumbnail: { thumbnails: [Array], sampledThumbnailColor: [Object] },
    videoCountText: { runs: [Array] },
    navigationEndpoint: {
      clickTrackingParams: 'CKoCELs3GAQiEwj-2Y7c0er7AhVJQA8CHdl4Bf4yBnNlYXJjaA==',
      commandMetadata: [Object],
      watchEndpoint: [Object]
    },
    trackingParams: 'CKoCELs3GAQiEwj-2Y7c0er7AhVJQA8CHdl4Bf4=',
    videos: [ [Object], [Object] ],
    thumbnailText: { runs: [Array] },
    longBylineText: { simpleText: "Snail's House, Moe Shop, dark cat, and more" },
    thumbnailOverlays: [ [Object], [Object], [Object] ],
    videoCountShortText: { runs: [Array] }
  }
}
{
  shelfRenderer: {
    title: { simpleText: '관련 동영상' },
    content: { verticalListRenderer: [Object] },
    trackingParams: 'CLoBENwcGAoiEwj-2Y7c0er7AhVJQA8CHdl4Bf4='
  }
}
{
  shelfRenderer: {
    title: { simpleText: '관련 학습' },
    content: { verticalListRenderer: [Object] },
    trackingParams: 'CFQQ3BwYDSITCP7ZjtzR6vsCFUlADwId2XgF_g=='
  }
}
*/