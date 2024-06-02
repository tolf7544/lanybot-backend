import { ProcessRole } from "./type.process"

export type ProcessQueueUnit = Omit<Process, "status">

export type Process = {
	role: ProcessRole,
	version: number,
	port: number,
	status: "previous" | "active" | "loading",
} 

export type Log = {
	role: "main" | keyof typeof ProcessRole,
	message: string
}

export type Status = "success" | "canceled" | "failed" | "error" 