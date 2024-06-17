/**
 * error message format
 * 
 * file (class) function reason
 * 
 */

export const portError = {
"0001": "port.port.'get data()' (fs.readFileSync error occured)",
"0002": "port.port.isUsingPort() (already using port. try next port...)",
"0003": "port.port.portLoopCheck() (all port is not useable. try again later.)"
} as const

export const portMessage = {
	"0011": "need client(process) connect socket.",
	} as const

export type PortError = keyof typeof portError;
export type PortMessage = keyof typeof portMessage;