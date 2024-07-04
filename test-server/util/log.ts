import { JsonLog, Log, LogOption, PortLogObject } from "../type/type.pm";
import fs from 'fs';
import version from "../config/version.json";
import { debugLog } from "./util";

export function logSetting() {
	if(fs.existsSync("../log")) {
		return true;
	} else {
		try {
			fs.mkdirSync("../log")
			return true;
		} catch (error) {
			console.log("mkdir failed. check permission.")
			return false;
		}
		
	}
}

export function simpleJsonLogger(file_name: string, option: LogOption, info?: JsonLog<PortLogObject>) {
	const date = new Date().getTime();
	const result = logSetting();
	if(result == false || info == undefined) {
		return;
	}

	if(option.execute == "save") {
		const saveObject = {
			date: date,
			fileName: file_name,
			data: info.object
		}
		fs.writeFileSync(`../log/port.${info.role}.txt`,`${JSON.stringify(saveObject)},`, {flag:"w"})
	} else {
		const JsonString = fs.readFileSync(`../log/port.${info.role}.txt`, "utf-8")
		return JSON.parse(`[${JsonString.slice(0,JsonString.length-1)}]`)
	}
}



export function portLogger(file_name: string,info: Log) {
	const date = new Date().getTime();
	const result = logSetting();
	if(result == false) {
		return;
	}

	fs.appendFile("../log/port",`${date} [${info.role}] ${info.message} \n ${file_name}`, (() => {/** empty */}))
}

export function processLogger(file_name: string,info: Log) {
	const date = new Date().getTime();
	const result = logSetting();
	if(result == false) {
		return;
	}

	debugLog(`${date} [${info.role}] ${info.message} \n ${file_name}`)
	fs.appendFile("../log/process",`${date} [${info.role}] ${info.message} \n ${file_name}`, (() => {/** empty */}))
}

export function heartbeatLogger(file_name: string, role: keyof typeof version.code) {
	const date = new Date().getTime();
	const result = logSetting();
	if(result == false) {
		return;
	}

	fs.appendFile("../log/status",`${role}${date} \n ${file_name}`, (() => {/** empty */}))
}