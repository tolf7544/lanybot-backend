import cluster from "cluster";
import { ROLE } from "../..";
import { ProcessMessage } from "../../type/type.versionManager";

if(cluster.isWorker) {
	process.on("message", ((message: string) => {
		const _m: ProcessMessage<"role"> | ProcessMessage<"cluster"> = JSON.parse(message)
		if(_m.process.type == "role") {
			ROLE.push(_m.role as string)
			ROLE.push(_m.isSlash as boolean)
		}
	}))
}