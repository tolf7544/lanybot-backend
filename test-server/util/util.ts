import { ProcessMessage, ProcessRoleCode } from "../type/type.process";
import net from "net";
import { obj } from '../type/type.util';

export function TodayDate() {
	const date = new Date();
	return date.toJSON().replace(/T|Z/g, " ");
}


export function heartBeat(client: net.Socket, role: ProcessRoleCode) {
	setInterval(() => {
		client.write(
			JSON.stringify(
				{
					type: "heartbeat",
					time: TodayDate(),
					role: role
				} as ProcessMessage))
	}, 1500)
}

export function debugLog(message: string) {
	console.log("--------------------------\n" + message + "\n--------------------------\n")
}


export function flattenObject<T extends obj>(object: T): false | obj {

	let checkDepth = 0;
	let isFinish = false;

	while (!isFinish) {
		let isChanged = false;
		checkDepth += 1;
		if (checkDepth == 1000) {
			return false;
		}
			const _temp = Array.from(Object.keys(object));

			
			_temp.forEach((k) => {
				if(typeof object[k] == "object" && Array.isArray(object[k]) !== true) {
					const childrenKeys = Array.from(Object.keys((object[k] as obj)))
					childrenKeys.forEach((v) => {
						(object[`${k} ${v}`] as unknown) = (object[k] as obj)[v];
						// Object.defineProperty(object, `${v} ${k}`, { value: _objectK[v] })
						delete (object[k] as obj)[v];
					})
					delete object[k];
					isChanged = true;
				}
			})
			if(isChanged == false) {
				isFinish = true;
			}
	}

	return object;
}

// export function flattenObject(object: obj, result: obj, depth: number, key?:string, depthLimit?: number) {
// 	if(depthLimit) {
// 		if(depth > depthLimit) {
// 			return false;
// 		}
// 	} else {
// 		if(depth > 1000) {
// 			return false;
// 		} 
// 	}
// 	depth += 1;
// 	const oldKey = Object.keys(object)
// 	// eslint-disable-next-line no-constant-condition
// 	if(typeof oldKey[0] == "object" && !Array.isArray(object[oldKey[0]])) {
// 		const temp = flattenObject(object[0] as obj, result, depth, `${key}.${oldKey[0]}`, depthLimit);
// 		console.log(temp)
// 	} else {
// 		result[key as string] =  object[0];
// 		return result;
// 	}
// } 

// /**
//  * 	if(depthLimit) {
// 		if(depth > depthLimit) {
// 			return false;
// 		}
// 	} else {
// 		if(depth > 1000) {
// 			return false;
// 		} 
// 	}
// 	depth += 1;
// 	const keys = Object.keys(object);
// 	if(keyStack.length == 0) {
// 		keyStack.push(keys[0])
// 	}

// 	if(typeof object[keyStack[0]] == "object" && !Array.isArray(object[keyStack[0]])) {
// 		for(let i = 0; i < Object.keys(object[keyStack[0]] as obj).length; i++) {
// 			keyStack.push(Object.keys((object[keyStack[0]]) as string)[0]);
// 			if(typeof (object[keyStack[0]] as obj)[keyStack[keyStack.length - 1]] == "object" && !Array.isArray((object[keyStack[0]] as obj)[keyStack[keyStack.length - 1]])) {
// 				flattenObject(object,keyStack,depth);
// 			} else {
// 				const key = JSON.stringify(keyStack).replace(/\[|\]|"/g, "").replace(/,/g, ".");
// 				object[key] = (object[keyStack[0]] as obj)[keyStack[keyStack.length - 1]]
// 				delete (object[keyStack[0]] as obj)[keyStack[keyStack.length - 1]]
// 				keyStack = keyStack.slice(keyStack.length-1, keyStack.length)
				
// 				if(Object.keys(object[keyStack[0]] as obj).length == 0) {
//                     delete object[keyStack[0]];
// 					keyStack = []
//                 }

				
//                 flattenObject(object, keyStack, depth);
// 			}
// 		}

// 		if(Object.keys(object).pop() as string == keyStack[0]) {
// 			return object;
// 		} else {
// 			return false;
// 		}
// 	} else {
//         return object;
//     }
//  */

// console.log(setObjectDepthOne(test))
// console.log(setObjectDepthOne(test1))

//  console.log(setObjectDepthOne(test2))

// import data from "../config/code-name.json"
// console.log(flattenObject(data))
