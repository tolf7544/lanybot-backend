import { codeEncoder } from "../setting/tokenizer";
import { codeDetail } from "./error";
import codeName from '../config/code-name.json';

function codeDetailTest() {
    const encoded = codeEncoder(`${codeName.checkpoint.port_management_class}`);
    if(encoded == "fail") {
        console.debug("fail");
        console.log("finished test.\nfunctionName:"+ "codeDetailTest");
    } else {
        console.debug(encoded)
        console.debug(encoded.toString());
        const result = codeDetail(encoded.toString());
        console.debug(result);
        console.log("finished test.\nfunctionName:"+ "codeDetailTest")
    }
    
}


function main() {
    codeDetailTest();
}

main();