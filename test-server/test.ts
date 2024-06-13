import { ProcessData, ProcessRole } from "./type/type.process";
import { port } from "./util/port";

const testProcessData:ProcessData = {
	role: ProcessRole.musicDatabase,
	active: false,
	notRegisterProcess: false,
	legacyUser: new Set(),
	port: 0,
}

function testDebug(message: unknown) {
    console.debug(`${JSON.stringify(message)}\n`)
}

function main() {
    const portSetting = new port(testProcessData);

	portSetting.getPortNumber().then((value) => {
		//testDebug(JSON.stringify(value))
	}).catch((e) => {
		//testDebug(JSON.stringify(e))
	})


}

main();