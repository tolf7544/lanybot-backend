import { ProcessRole } from "../type/type.process";
import { subProcess } from "./sub-process";

function main() {
	const process = new subProcess(ProcessRole.musicCommand);
	process.connectManagementProcess();
}

main();