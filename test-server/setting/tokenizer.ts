import codeName from '../config/code-name.json'
import { Status } from '../type/type.util';
import { flattenObject } from '../util/util'
import { setCodeToken } from './config';
import fs from 'fs';
const vocabDir = "../config/code-token.json";

export function codeTokenizer():Status {
    const result = flattenObject(codeName);

    if(typeof result == "boolean") {
        return "error"
    } else {
        const keyArr = Array.from(Object.keys(result));

        const vocab: Map<string,number> = new Map();

        for(const key of keyArr) {
            const tokenArr = key.split(/ |-|_/g)
            
            for(const token of tokenArr) {
                if(vocab.has(token)) {
                    continue;
                } else {
                    vocab.set(token,vocab.size);
                }
            }
        }
        
        const _result = setCodeToken(vocab);
        return _result;
    }
}

function loadVocab(): Status | Map<string, number> {
    if(fs.existsSync(vocabDir)) {
        return new Map(JSON.parse(fs.readFileSync(vocabDir, {encoding: "utf-8"})))
    } else {
        return "fail";
    }
}


export function codeEncoder(input: string):Status | number[] {
    const result = loadVocab();
    if(result == "fail") {
        return "fail";
    } else {
        const vocab = result as Map<string,number>
        const tokenArr = input.split(/ |-|_/g);
        const encoded = [];
        for(const token of tokenArr) {
            if(vocab.has(token)) {
                encoded.push(vocab.get(token) as number)
            } else {
                vocab.set(token,vocab.size);
                encoded.push(vocab.size);
            }
        }

        const _result = setCodeToken(vocab);

        if(_result == "fail") {
            return _result;
        } else {
            return encoded;
        }
    }
}


export function codeDecoder(input: Array<string | number>):string | Status {
    const result = loadVocab();
    if(result == "fail") {
        return "fail";
    } else {
        const vocab = result as Map<string,number>
        let decoded: string = "";

        for(let token of input) {
            const entries = Array.from(vocab.entries());
            if(typeof token == "string") {
                token = parseInt(token);
            }
            let isExist = false;

            for(const entry of entries) {
                if(entry[1] == token) {
                    isExist = true;
                    decoded += " " + entry[0];
                }
            }
            if(isExist == false) {
                decoded += "unk";
            }
        }

        return decoded;
    }
}