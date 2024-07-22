import { codeCount } from './type.code';
/**
 * 
 * success -> function end & expacted result
 * finish -> function end & unknwon result
 * cancel -> function is successfully stopped
 * fail -> function has error occurred but reacted.
 * error -> function has error occurred and couldnt reacted.
 * pending -> function is async and wait for finish. (if use this status, you need to add timeout)
 */
export type Status = "start" | "success" | "finish" | "cancel" | "fail" | "error" | "pending"

const getIncreaseCodeNumbers = (needNumberCount: number) => {
    const temp = [];
    
    for (let i = codeCount+1; i < needNumberCount; i++) {
        temp.push(i);
        
    }
}

/**
 * select specific type from type groups by using type parameter 
 */
export type TypeSelector<G,TN> = Extract<G,{type: TN}>;

 
export type obj = {[key:string]: unknown}