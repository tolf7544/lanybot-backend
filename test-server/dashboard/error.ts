import { codeDecoder } from "../setting/tokenizer";
import { Status } from "../type/type.util";
import { flattenObject } from "../util/util";
import codeName from '../config/code-name.json';

export function codeDetail(code:string): Status | string | number {
    const key = codeDecoder(Array.from(code));
    if(key == undefined) {
        return "fail"
    }

    const _result = flattenObject(codeName)

    if(_result == false) {
        return "error"
    } else {
        return _result[key] as string | number;
    }
}