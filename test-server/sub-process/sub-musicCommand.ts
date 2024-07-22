import { roleCode } from "../type/type.process";
import { subProcess } from "./sub-process";

function main() {
	const process = new subProcess(roleCode.musicCommand);
	// process.manageMainSocket({"execution": "Main-register-process"});
}

main();