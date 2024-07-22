export const roleCode = { // 서비스 역할 코드
	"processManagement": "0000",
	"musicCommand": "0001",
	"musicDatabase": "0002",
	"musicStream": "0003",
	"securitySpam": "0004",
} as const

export const classCode = {
	"sub process management class": "1001",
	"port management class": "1002"
} as const

export const ipcTypeCode = {

}


let temp: number = NaN;
Object.keys(module.exports).forEach((v) => temp += Object.keys(module.exports[v]).length);

export const codeCount = temp;