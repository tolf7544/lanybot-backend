import { ProcessData, roleCode } from "./type/type.process";
import { portManager } from "./util/port";


const testProcessData:ProcessData = {
	role: roleCode.musicDatabase,
	active: false,
	notRegisterProcess: false,
	legacyUser: new Set(),
	port: 0,
	client: undefined,
	registerPatient: 0,
	timeout: 2000,
	maximumPatient: 0
}

function testDebug(message: unknown) {
    console.debug(`${JSON.stringify(message)}\n`)
}

function main() {
	return new Promise((resolve, reject) => {
		let isFinish = false;

		setTimeout(() => {
			if(isFinish) {return}
			reject(false);
			console.log("after")
		}, 2000);
		
		isFinish = true;
		console.log("run")
		resolve(true)
	})
}

main();