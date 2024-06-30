import { processRole } from "../type/type.process";
import { subProcess } from "./sub-process";

function main() {
	const process = new subProcess(processRole.musicCommand);
	process.manageMainSocket({"execution": "Main-register-process"});
}

main();