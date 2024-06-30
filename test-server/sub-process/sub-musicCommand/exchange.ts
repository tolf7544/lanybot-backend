import net from 'net';
import { ClientData, ExchangeProcessData, ProcessData } from '../../type/type.process';
import { debugLog } from '../../util/util';

export function exchangeResponse(processData:ProcessData, client: net.Socket,clientData:ExchangeProcessData) {
	debugLog("add legacy process client user data...")
	const userList:ClientData = JSON.parse(clientData.userList);
	processData.legacyUser = userList;
	debugLog("add legacy process client user data... finished")
}
export function exchangeRequest(processData:ProcessData, client: net.Socket,clientData:ExchangeProcessData) {
	debugLog("add legacy process client user data...")
	const userList:ClientData = JSON.parse(clientData.userList);
	processData.legacyUser = userList;
	debugLog("add legacy process client user data... finished")
}