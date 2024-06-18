/**
 * 
 * success -> function end & expacted result
 * finish -> function end & unknwon result
 * cancel -> function is successfully stopped
 * fail -> function has error occurred but reacted.
 * error -> function has error occurred and couldnt reacted.
 * pending -> function is async and wait for finish. (if use this status, you need to add timeout)
 */
export type Status = "success" | "finish" | "cancel" | "fail" | "error" | "pending"