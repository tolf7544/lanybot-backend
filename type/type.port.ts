import { PortConfig } from "../test-server/type/type.process";

export interface PortInfo {
	get portInfo(): PortConfig | number
}