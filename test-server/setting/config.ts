import fs from 'fs';
import { Status } from '../type/type.util';
function configDirSetting() {
    if(fs.existsSync("../config")) {
		return true;
	} else {
		try {
			fs.mkdirSync("../config")
			return true;
		} catch (error) {
			console.log("mkdir failed. check permission.")
			return false;
		}		
	}
}

export function setCodeToken(vocab: Map<string,number>): Status {
    const result = configDirSetting()
    if(!result) {
        return "fail";
    }

    fs.writeFileSync('../config/code-token.json',JSON.stringify(Array.from(vocab.entries())), {flag:"w"})

    return "finish"
}

export function codeNumberSetting(params:type) {
    
}