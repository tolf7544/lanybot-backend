import { ProcessData, ProcessRole } from "./type/type.process";
import { portManager } from "./util/port";
const testProcessData:ProcessData = {
	role: ProcessRole.musicDatabase,
	active: false,
	notRegisterProcess: false,
	legacyUser: new Set(),
	port: 0,
	client: undefined,
	registerPatient: 0,
	maximumPatient: 0
}

function testDebug(message: unknown) {
    console.debug(`${JSON.stringify(message)}\n`)
}

function main() {
    const portSetting = new portManager(testProcessData);

	portSetting.getPortNumber().then((value) => {
		//testDebug(JSON.stringify(value))
	}).catch((e) => {
		//testDebug(JSON.stringify(e))
	})


}

main();