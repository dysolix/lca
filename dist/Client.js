var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import HttpsClient from "./HttpsClient";
import { exec } from "child_process";
import { WebSocket } from "ws";
import { delay } from "./Util";
import ChampSelectSession from "./Classes/ChampSelectSession";
import RunePage from "./Classes/RunePage";
export default class Client {
    /**
     * @param autoReconnect Determines if the client should automatically try to reconnect if the connection closes. Defaults to true.
     */
    constructor(autoReconnect = true) {
        this.isConnected = false;
        this.port = null;
        this.authToken = null;
        this.webSocket = null;
        this.httpClient = null;
        this.champSelectSession = null;
        this.gameFlowPhase = "None";
        this.runePages = [];
        //#endregion
        this.eventHandlers = new Map();
        this.oneTimeEventHandlers = new Map();
        this.subscribedEvents = [];
        window.leagueClient = this;
        this.autoReconnect = autoReconnect;
    }
    on(event, callback) {
        var _a;
        if (!this.eventHandlers.has(event))
            this.eventHandlers.set(event, []);
        (_a = this.eventHandlers.get(event)) === null || _a === void 0 ? void 0 : _a.push(callback);
    }
    once(event, callback) {
        var _a;
        if (!this.oneTimeEventHandlers.has(event))
            this.oneTimeEventHandlers.set(event, []);
        (_a = this.oneTimeEventHandlers.get(event)) === null || _a === void 0 ? void 0 : _a.push(callback);
    }
    emit(event, ...args) {
        var _a, _b;
        (_a = this.eventHandlers.get(event)) === null || _a === void 0 ? void 0 : _a.forEach(callback => callback.apply(null, args));
        (_b = this.oneTimeEventHandlers.get(event)) === null || _b === void 0 ? void 0 : _b.forEach(callback => callback.apply(null, args));
        this.oneTimeEventHandlers.clear();
    }
    //#region Connection
    /**
     * Asynchronously connects to the League of Legends client
     */
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isConnected)
                return;
            this.webSocket = null;
            this.port = null;
            this.authToken = null;
            this.httpClient = null;
            yield new Promise((resolve, reject) => {
                exec('wmic PROCESS WHERE name=\'LeagueClientUx.exe\' GET commandline', (error, stdout, stderr) => {
                    var _a, _b;
                    let portArr = stdout.match("--app-port=([0-9]*)");
                    let passArr = stdout.match("--remoting-auth-token=([\\w-]*)");
                    if (portArr !== null && passArr !== null && ((_a = portArr === null || portArr === void 0 ? void 0 : portArr.length) !== null && _a !== void 0 ? _a : 0) === 2 && ((_b = passArr === null || passArr === void 0 ? void 0 : passArr.length) !== null && _b !== void 0 ? _b : 0) === 2) {
                        resolve({ port: Number(portArr[1]), authToken: String(passArr[1]) });
                    }
                    else {
                        reject();
                    }
                });
            }).then((data) => {
                let port = data.port;
                let authToken = Buffer.from(("riot:" + data.authToken)).toString("base64");
                let ws = new WebSocket(("wss://127.0.0.1:" + port), undefined, { headers: { Authorization: "Basic " + authToken }, rejectUnauthorized: false });
                ws.onopen = (ev) => {
                    this.isConnected = true;
                    this.webSocket = ws;
                    this.port = port;
                    this.authToken = authToken;
                    this.emit("connection-state-change", true);
                    this.httpClient = new HttpsClient("127.0.0.1", port, { 'Authorization': "Basic " + authToken });
                    // EVENTS
                    for (let eventName of Object.values(LCA.LCUEvent))
                        this.subscribeEvent(eventName);
                    setTimeout(() => this.updateRunePages(), 2500);
                };
                ws.onclose = (ev) => __awaiter(this, void 0, void 0, function* () {
                    this.isConnected = false;
                    this.emit("connection-state-change", false);
                    yield delay(2500);
                    if (this.autoReconnect)
                        this.connect();
                });
                ws.onerror = (ev) => {
                    //SUPRESSES CONSOLE ERRORS
                };
                ws.onmessage = (ev) => {
                    try {
                        let data = JSON.parse(ev.data.toString('utf8'));
                        if (data.length == 3)
                            this.onSubscribedEvent(data);
                    }
                    catch (ex) { }
                };
            }, (err) => __awaiter(this, void 0, void 0, function* () {
                yield delay(2500);
                if (this.autoReconnect)
                    this.connect();
                else
                    throw new Error("Unable to connect to the League of Legends client.");
            }));
        });
    }
    subscribeEvent(eventName) {
        if (this.subscribedEvents.includes(eventName))
            return;
        if (this.webSocket !== null && this.webSocket.readyState === 1) {
            this.webSocket.send(JSON.stringify([5, eventName]));
            this.subscribedEvents.push(eventName);
        }
    }
    unsubscribeEvent(eventName) {
        if (this.webSocket !== null && this.webSocket.readyState === 1) {
            this.webSocket.send(JSON.stringify([6, eventName]));
        }
    }
    onSubscribedEvent(event) {
        var _a;
        let value = event[2];
        let eventType = value.eventType;
        let uri = value.uri;
        let data = value.data;
        const Events = LCA.LCUEvent;
        switch (event[1]) {
            case Events.GameFlowPhase: {
                if (this.gameFlowPhase !== data) {
                    (_a = this.eventHandlers.get("game-flow-phase-change")) === null || _a === void 0 ? void 0 : _a.forEach(callback => callback(this.gameFlowPhase, data));
                    this.gameFlowPhase = data;
                }
                break;
            }
            case Events.TeamBuilderChampSelect: {
                if (uri === "/lol-lobby-team-builder/champ-select/v1/session") {
                    if (eventType === "Delete") {
                        this.champSelectSession = null;
                        this.emit("champ-select-session-update");
                        return;
                    }
                    let session = new ChampSelectSession(data);
                    if (this.champSelectSession !== null) {
                        if (session.getPhase() !== this.champSelectSession.getPhase()) {
                            this.emit("champ-select-phase-change", this.champSelectSession.getPhase(), session.getPhase());
                        }
                        if (session.getPhase() === "BAN" && this.champSelectSession.getPhase() === "INTENT") {
                            this.emit("champ-select-local-player-ban");
                        }
                        if (session.inProgressActionIds.includes(session.ownPickActionId) && !this.champSelectSession.inProgressActionIds.includes(session.ownPickActionId)) {
                            this.emit("champ-select-local-player-pick");
                        }
                        if (session.getActionById(session.ownPickActionId).completed && !this.champSelectSession.getActionById(session.ownPickActionId).completed) {
                            this.emit("champ-select-local-player-pick-completed", session.getActionById(session.ownPickActionId).championId);
                        }
                    }
                    else {
                        this.emit("champ-select-phase-change", "NONE", session.getPhase());
                    }
                    this.champSelectSession = session;
                    this.emit("champ-select-session-update");
                }
                break;
            }
            default:
                break;
        }
    }
    //#endregion
    //#region Ready Check
    /**
     * Accepts a ready check
     */
    acceptMatch() {
        if (this.httpClient === null)
            return;
        let request = this.httpClient.createRequest("POST", "/lol-lobby-team-builder/v1/ready-check/accept");
        request.send(response => { }).end();
    }
    /**
     * Declines a ready check
     */
    declineMatch() {
        if (this.httpClient === null)
            return;
        let request = this.httpClient.createRequest("POST", "/lol-lobby-team-builder/v1/ready-check/decline");
        request.send(response => { }).end();
    }
    //#endregion
    //#region Champ Select
    /**
     * Declares intent to pick given champion
     * @param id The champion's id
     */
    declarePickIntent(id) {
        if (this.httpClient === null)
            return;
        if (this.champSelectSession === null)
            return;
        let request = this.httpClient.createRequest("PATCH", "/lol-lobby-team-builder/champ-select/v1/session/actions/" + this.champSelectSession.ownPickActionId);
        request.setHeader("Content-Type", "application/json");
        let req = request === null || request === void 0 ? void 0 : request.send((response) => { });
        req.write(JSON.stringify({ championId: Number(id) }));
        req.end();
    }
    /**
     * Declares intent to ban given champion
     * @param id The champion's id
     */
    declareBanIntent(id) {
        if (this.httpClient === null)
            return;
        if (this.champSelectSession === null)
            return;
        let request = this.httpClient.createRequest("PATCH", "/lol-lobby-team-builder/champ-select/v1/session/actions/" + this.champSelectSession.ownBanActionId);
        request.setHeader("Content-Type", "application/json");
        let req = request === null || request === void 0 ? void 0 : request.send((response) => { });
        req.write(JSON.stringify({ championId: Number(id) }));
        req.end();
    }
    /**
     * Locks the champion pick
     */
    lockPick() {
        if (this.httpClient === null)
            return;
        if (this.champSelectSession === null)
            return;
        this.httpClient.createRequest("POST", "/lol-lobby-team-builder/champ-select/v1/session/actions/" + this.champSelectSession.ownPickActionId + "/complete").send(res => { }).end();
    }
    /**
     * Locks the champion ban
     */
    lockBan() {
        if (this.httpClient === null)
            return;
        if (this.champSelectSession === null)
            return;
        this.httpClient.createRequest("POST", "/lol-lobby-team-builder/champ-select/v1/session/actions/" + this.champSelectSession.ownBanActionId + "/complete").send(res => { }).end();
    }
    //#endregion
    //#region Runes
    /**
     * @returns The currently active rune page or null, if not found
     */
    getActiveRunePage() {
        let rp = null;
        this.runePages.forEach(page => {
            if (page.current)
                rp = page;
        });
        return rp;
    }
    /**
     * Retrieves the rune pages from the client
     */
    updateRunePages(callback = undefined) {
        if (this.httpClient === null)
            return;
        let req = this.httpClient.createRequest('GET', '/lol-perks/v1/pages').send((res) => {
            var body = [];
            res.on('data', (chunk) => {
                body.push(chunk);
            });
            res.on('end', () => {
                try {
                    body = JSON.parse(Buffer.concat(body).toString());
                }
                catch (e) {
                    return;
                }
                this.runePages = body.map(entry => new RunePage(entry));
                if (typeof callback === 'function')
                    callback(this.runePages);
                this.emit("runes-reloaded", this.runePages);
            });
        });
        req.end();
    }
    /**
     * @returns An array of editable rune pages
     */
    getEditableRunePages() {
        let pages = [];
        this.runePages.forEach(page => {
            if (page.isEditable)
                pages.push(page);
        });
        return pages;
    }
    /**
     * Sets a rune page as the active rune page
     * @param id The rune page's id
     */
    setActiveRunePage(id) {
        if (this.httpClient === null)
            return;
        let request = this.httpClient.createRequest("PUT", "/lol-perks/v1/currentpage");
        let req = request.send((response) => { this.updateRunePages(); });
        req.write(String(id));
        req.end();
    }
    /**
     * Deletes a rune page
     * @param id The rune page's id
     */
    deleteRunePage(id) {
        if (this.httpClient === null)
            return;
        let request = this.httpClient.createRequest("DELETE", "/lol-perks/v1/pages/" + id);
        let req = request.send((response) => { this.updateRunePages(); });
        req.end();
    }
    /**
     * Creates a rune page in the client
     * @param page The rune page
     */
    createRunePage(page) {
        if (this.httpClient === null)
            return;
        let request = this.httpClient.createRequest("POST", "/lol-perks/v1/pages");
        request.setHeader('Content-Type', 'application/json');
        let req = request.send((response) => { this.updateRunePages(); });
        req.write(JSON.stringify(page));
        req.end();
    }
    /**
     * Searches for a rune page with a certain id
     * @param id The id to search for
     */
    getRunePageById(id) {
        var _a;
        return (_a = this.runePages.find(page => page.id === Number(id))) !== null && _a !== void 0 ? _a : null;
    }
}
