/**
 * error message format
 * 
 * file (class) function reason
 * 
 */

export const portError = {
"0001": "port.port.'get data()' (fs.readFileSync error occured)",
"0002": "port.port.isUsingPort() (already using port. try next port...)"
} as const

export type PortError = keyof typeof portError;