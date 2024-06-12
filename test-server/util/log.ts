import { Log } from "../type/type.pm";
import fs from 'fs';
import version from "../config/version.json";
import { debugLog } from "./util";

export function portLogger(file_name: string,info: Log) {
	const date = new Date().getTime();
	fs.appendFile("../log/port",`${date} [${info.role}] ${info.message} \n ${file_name}`, (() => {/** empty */}))
}

export function processLogger(file_name: string,info: Log) {
	const date = new Date().getTime();
	debugLog(`${date} [${info.role}] ${info.message} \n ${file_name}`)
	fs.appendFile("../log/process",`${date} [${info.role}] ${info.message} \n ${file_name}`, (() => {/** empty */}))
}

export function heartbeatLogger(file_name: string, role: keyof typeof version.code) {
	const date = new Date().getTime();

	fs.appendFile("../log/status",`${role}${date} \n ${file_name}`, (() => {/** empty */}))
}