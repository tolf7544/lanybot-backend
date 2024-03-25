import { setTime } from "../commands/music/common/yt_video/getMusicData";
import { CommunityServer } from "../type/type.common";

interface PageInfo {
	maxCount: number,
	rowCountPerPage: number;
	pageCount:number;
	activePage: number;
	isSinglePage: boolean
}

export interface Row {
	name: string,
	value: string
}



export class Pageination {
	cPageInfo: PageInfo = {
		maxCount: 0,
		rowCountPerPage: 0,
		pageCount: 0,
		activePage: 0,
		isSinglePage: false,
	};
	cRowData: Array<Row> = [];
	cRow:Array<Array<Row>> = [];
	constructor(rowList:Array<Row>,_rowCountPerPage:number) {
		this.cRowData = rowList;
		this.cPageInfo.maxCount = rowList.length;
		this.cPageInfo.rowCountPerPage = _rowCountPerPage;
		this.cPageInfo.activePage = 1;
		this.cPageInfo.pageCount = Math.ceil(rowList.length / _rowCountPerPage);
		this.cPageInfo.isSinglePage = this.cPageInfo.pageCount == 1? true : false;
	}

	PageSetting() {
		for(let i=0; i < this.cPageInfo.pageCount; i++) {
			const temp:Array<Row> = [];
			for(let j=0; j < this.cPageInfo.rowCountPerPage; j++) {
				
				if(i == 0) {
					if(this.cPageInfo.isSinglePage) {
						if(this.cPageInfo.maxCount > j) {
							temp.push(this.cRowData[j])
						}
					}
					else {
						temp.push(this.cRowData[j])
					}
				} else if(this.cRowData.length - i*this.cPageInfo.rowCountPerPage >= 0) {
					temp.push(this.cRowData[i*this.cPageInfo.rowCountPerPage + j])
				} else {
					if(this.cRowData.length - (this.cPageInfo.rowCountPerPage*i - this.cPageInfo.rowCountPerPage) - j >= 0) {
						temp.unshift(this.cRowData[this.cRowData.length - (this.cPageInfo.rowCountPerPage*i - this.cPageInfo.rowCountPerPage) - j])
					} else {
						temp.push([] as unknown as Row)
					}
				}
			}
			this.cRow.push(temp)
		}
	}

	get activePage() {
		const _activePage = this.cRow[this.cPageInfo.activePage-1];
		const temp = [];
		for(const _row of _activePage) {
			if(_row != undefined) {
				temp.push(_row)
			}
		}
		return temp
	}

	nextPage() {
		if(this.cPageInfo.activePage + 1 > this.cPageInfo.pageCount) {
			return [];
		} else {
			this.cPageInfo.activePage += 1;
			const _activePage = this.cRow[this.cPageInfo.activePage-1];
			const temp = [];
			for(const _row of _activePage) {
				if(_row != undefined) {
					temp.push(_row)
				}
			}
			return temp
		}
	}

	previousPage() {
		if(this.cPageInfo.activePage - 1 < 0) {
			return [];
		} else {
			this.cPageInfo.activePage -= 1;
			const _activePage = this.cRow[this.cPageInfo.activePage-1];
			const temp = [];
			for(const _row of _activePage) {
				if(_row != undefined) {
					temp.push(_row)
				}
			}
			return temp;
		}
	}

	DeleteActiveColumn(index:number) {
		this.cRow[this.cPageInfo.activePage-1].splice(index-1, 1)
	}
	AddColumn(music:any,server:CommunityServer) {
		const _row:Row = {
			name: this.cRowData.length+"." + music.videoData.title,
			value: `${setTime(music.timeS,server)} [youtube link](https://www.youtube.com/watch?v=${music.id})`
		} 
		this.cRowData.push(_row);
		this.cPageInfo.maxCount += 1;
		this.cPageInfo.pageCount = Math.ceil(this.cRowData.length / this.cPageInfo.rowCountPerPage);
		this.cPageInfo.isSinglePage = this.cPageInfo.pageCount == 1? true : false;

		this.PageSetting()
	}
}