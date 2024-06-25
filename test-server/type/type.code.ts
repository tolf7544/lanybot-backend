
/**
 * class or function inital code.
 * 
 * used progress integrity check.
 */
export const initalCode = {
	Port: 1,
	SubProcess: 2,
} as const; 

export type InitalCode = typeof initalCode;