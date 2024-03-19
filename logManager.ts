import fs from 'fs';
import hash from 'hash.js';
import { LogFormat } from "./type/type.log";


export class serverLogger {
    private baseURL: string;
    private date: Date;
    private get timeId() { return `_${this.date.getUTCHours()}${this.date.getUTCMinutes()}${this.date.getUTCSeconds()}${this.date.getUTCMilliseconds()}_` }

    constructor() {
        this.baseURL = __dirname + "/save/serverlog/";
        this.date = new Date();
    }

    private MkSystemLogDir(): Promise<string> {
        return new Promise<string>((resolve) => {
            if(!fs.existsSync(this.baseURL)) fs.mkdirSync(this.baseURL,{ recursive: true })

            const year = this.date.getUTCFullYear();
            const month = this.date.getUTCMonth();
            const date = this.date.getUTCDate();

            if(!fs.existsSync(this.baseURL + year)) fs.mkdirSync(this.baseURL + year,{ recursive: true })
            if(!fs.existsSync(this.baseURL + year + "/" + month)) fs.mkdirSync(this.baseURL + year + "/" + month,{ recursive: true })
            if(!fs.existsSync(this.baseURL + year + "/" + month + "/" + date)) fs.mkdirSync(this.baseURL + year + "/" + month + "/" + date,{ recursive: true })
            resolve(year + "/" + month + "/" + date);

        });
    }

    private MkSystemLogJsonFile( DateDir:string,LogData: LogFormat) {
        let count: number = 0;

        const dir = fs.readdirSync(this.baseURL + DateDir);

        if (dir.length == 0) count = 1;
        else count = dir.length + 1;

        const fileId = `${count}${this.timeId}`;

        fs.writeFileSync(`${this.baseURL}${DateDir}/${fileId}.json`, JSON.stringify(LogData));
        /** https://stackoverflow.com/questions/65152373/typescript-serialize-bigint-in-json */
    }

    writeLog(LogData: LogFormat) {
        this.MkSystemLogDir().then((DateDir) => {
            const date = new Date();
            LogData.date = date.toUTCString();
            this.MkSystemLogJsonFile(DateDir, LogData);
            return true;
        });
    }
}

export class Logger {
    private baseURL: string;
    private userId: string;
    private guildId: string;
    private date: Date;

    private get userIdHash() { return hash.sha256().update(this.userId).digest('hex') }
    private get guildIdHash() { return hash.sha256().update(this.guildId).digest('hex') }
    private get timeId() { return `_${this.date.getUTCHours()}${this.date.getUTCMinutes()}${this.date.getUTCSeconds()}${this.date.getUTCMilliseconds()}_` }



    private mkGuildDir(): Promise<string> { // return GuildDir
        return new Promise<string>((resolve) => {
            if(!fs.existsSync(this.baseURL)) fs.mkdirSync(this.baseURL,{ recursive: true });

            const year = this.date.getUTCFullYear();
            const month = this.date.getUTCMonth();
            const date = this.date.getUTCDate();

            if(!fs.existsSync(this.baseURL+ this.guildIdHash)) fs.mkdirSync(this.baseURL + this.guildIdHash,{ recursive: true })
            if(!fs.existsSync(this.baseURL+ this.guildIdHash + "/" + year)) fs.mkdirSync(this.baseURL + this.guildIdHash + "/" + year,{ recursive: true })
            if(!fs.existsSync(this.baseURL + this.guildIdHash + "/" + year + "/" + month)) fs.mkdirSync(this.baseURL + this.guildIdHash + "/" + year + "/" + month,{ recursive: true })
            if(!fs.existsSync(this.baseURL + this.guildIdHash + "/" + year + "/" + month + "/" + date)) fs.mkdirSync(this.baseURL + this.guildIdHash + "/" + year + "/" + month + "/" + date,{ recursive: true })

            resolve(this.guildIdHash + "/" + year + "/" + month + "/" + date);
        });
    }

    private mkUserDir(): Promise<string> {  // return UserDir
        return new Promise<string>((resolve) => {
            this.mkGuildDir().then((GuildDir) => {

                if(!fs.existsSync(this.baseURL + GuildDir + "/" + this.userIdHash)) fs.mkdirSync(this.baseURL + GuildDir + "/" + this.userIdHash,{ recursive: true })

                resolve(GuildDir + "/" + this.userIdHash);
            })
        });
    }

    private mkUserJsonFile(userDir: string, LogData: LogFormat, isError: boolean) {
        let count: number = 0;
        let IsError: number;

        const dir = fs.readdirSync(this.baseURL + userDir);

        if (dir.length == 0) count = 1;
        else count = dir.length + 1;

        if (isError) IsError = 1;
        else IsError = 0;
        const fileId = `${count}${this.timeId}${IsError}`;

        fs.writeFileSync(`${this.baseURL}${userDir}/${fileId}.json`, JSON.stringify(LogData));
    }

    constructor(UserId: string, GuildId: string) {
        this.baseURL = __dirname + "save/errorlog/";
        this.userId = UserId;
        this.guildId = GuildId;
        this.date = new Date();
    }




    writeLog(LogData: LogFormat) {
        this.mkUserDir().then((userDir) => {
            this.mkUserJsonFile(userDir, LogData, LogData.isError);
            return true;
        });
    }
}
