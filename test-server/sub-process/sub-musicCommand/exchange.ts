import net from 'net';
import { ClientData, ExchangeProcessData, ProcessData, ProcessRegister } from '../../type/type.process';
import { TodayDate, debugLog } from '../../util/util';
import { processData } from '../sub-musicCommand';

export function exchangeResponse(client: net.Socket,clientData:ExchangeProcessData) {
	debugLog("add legacy process client user data...")
	const userList:ClientData = JSON.parse(clientData.userList);
	processData.legacyUser = userList;
	debugLog("add legacy process client user data... finished")
}
export function exchangeRequest(client: net.Socket,clientData:ExchangeProcessData) {
	debugLog("add legacy process client user data...")
	const userList:ClientData = JSON.parse(clientData.userList);
	processData.legacyUser = userList;
	debugLog("add legacy process client user data... finished")
}