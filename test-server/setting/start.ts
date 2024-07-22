import { Action } from "../type/type.setting";
import { codeTokenizer } from "./tokenizer";

const action:Action = "codeSetting";

function main():boolean {
    if(action == "codeSetting") {
        const _result = codeTokenizer();

        if(_result == "fail") {
            console.log("tokenizing failed.")
        } else if(_result == "error") {
            console.log("failed collect object from code-name.json");
        } else {
            console.log("tokenizing successed.")
        }
        return true;

    } else if(action == "checkIntegrity") {
        /** empty */
        return false;
    } else {
        /** empty */
        return false;
    }
}


main();