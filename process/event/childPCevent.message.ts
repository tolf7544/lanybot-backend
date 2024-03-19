import cluster from "cluster";
import { ProcessMessage } from "../../type/type.versionManager";

if(cluster.isWorker) {
	process.on("message", ((message: string) => {
		const _m: ProcessMessage<"cluster"> = JSON.parse(message)
		
		if (_m.type == "cluster" && _m.path) {
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const command = require(_m.path as string);
			command.execute(_m)
		}
	}))
}