import axios from "axios"
import { GoogleAPI } from "../../../type/type.error"

export default class MessageURLFilter {
	API_KEY="AIzaSyDSdMvMncbG4HoxOHtLr5ykxnollC3iCqA"

	async checkURL(url:string) {
		const result = await axios.post("https://safebrowsing.googleapis.com/v4/threatMatches:find?key="+this.API_KEY,
		{
			"client": {
				"clientId":      "laybot",
				"clientVersion": "1.0.0"
			},
			"threatInfo": {
				"threatTypes":      ["MALWARE", "SOCIAL_ENGINEERING"],
				"platformTypes":    ["WINDOWS"],
				"threatEntryTypes": ["URL"],
				"threatEntries": [
				{"url": url}
				]
			}
		},
		{
			headers: {
				"Content-Type": "application/json"
			}
		}
		)
	
	if(result.status == 200) {
		// eslint-disable-next-line no-prototype-builtins
		if(result.data.hasOwnProperty("matches")) {
			return true
		} else {
			return false
		}
	} else {
		if(result.status == 429) {
			return GoogleAPI.ResourceExhausted
		} else if (result.status == 400 || result.status == 403) {
			return GoogleAPI.BadRequest
		} else if (result.status == 500 || result.status == 503 || result.status == 504) {
			return GoogleAPI.InternalServerError
		}
	}
	}
}
