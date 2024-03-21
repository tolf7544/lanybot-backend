import { ProcessMessage } from "../../type/type.versionManager"

export function run() {
	process.on("message",(message: string) => {
		const data = JSON.parse(message) as ProcessMessage<"cluster">
		console.log(data)
	})
}