import HttpsClient from "./HttpsClient";
import { exec } from "child_process";
import * as WebSocket from "ws";
import { delay } from "./Util";
import ChampSelectSession from "./Types/ChampSelectSession";
import RunePage from "./Types/RunePage";

type ConnectionStateChangeCallback = (state: boolean) => void;

type ChampSelectSessionUpdateCallback = () => void;
type ChampSelectPhaseChangeCallback = (previousPhase: LCA.ChampSelectPhase, phase: LCA.ChampSelectPhase) => void;
type ChampSelectLocalPlayerBanCallback = () => void;
type ChampSelectLocalPlayerPickCallback = () => void;
type ChampSelectLocalPlayerPickCompletedCallback = (championId: number) => void;

type GameFlowPhaseChangeCallback = (previousPhase: LCA.GameFlowPhase, phase: LCA.GameFlowPhase) => void;

type RunesReloadedCallback = (runes: LCA.RunePage[]) => void;

declare global {
    var leagueClient: Client
}

type Nullable<T> = LCA.Nullable<T>;

export default class Client {
    public isConnected: boolean = false;

    public port: Nullable<number> = null;
    public authToken: Nullable<string> = null;

    private webSocket: Nullable<WebSocket> = null;
    private httpClient: Nullable<HttpsClient> = null;

    public champSelectSession: Nullable<ChampSelectSession> = null;
    public gameFlowPhase: LCA.GameFlowPhase = "None";
    public runePages: RunePage[] = [];

    private autoReconnect: boolean;

    constructor(autoReconnect = true) {
        leagueClient = this;
        this.autoReconnect = autoReconnect;
    }

    on(event: "connection-state-change", callback: ConnectionStateChangeCallback): void;
    on(event: "champ-select-session-update", callback: ChampSelectSessionUpdateCallback): void;
    on(event: "champ-select-phase-change", callback: ChampSelectPhaseChangeCallback): void;
    on(event: "champ-select-local-player-ban", callback: ChampSelectLocalPlayerBanCallback): void;
    on(event: "champ-select-local-player-pick", callback: ChampSelectLocalPlayerPickCallback): void;
    on(event: "champ-select-local-player-pick-completed", callback: ChampSelectLocalPlayerPickCompletedCallback): void;
    on(event: "game-flow-phase-change", callback: GameFlowPhaseChangeCallback): void;
    on(event: "runes-reloaded", callback: RunesReloadedCallback): void;

    on(event: LCA.LCAEvent, callback: (...args: any[]) => void) {
        if (!this.eventHandlers.has(event))
            this.eventHandlers.set(event, []);

        this.eventHandlers.get(event)?.push(callback);
    }

    once(event: "connection-state-change", callback: ConnectionStateChangeCallback): void;
    once(event: "champ-select-session-update", callback: ChampSelectSessionUpdateCallback): void;
    once(event: "champ-select-phase-change", callback: ChampSelectPhaseChangeCallback): void;
    once(event: "champ-select-local-player-ban", callback: ChampSelectLocalPlayerBanCallback): void;
    once(event: "champ-select-local-player-pick", callback: ChampSelectLocalPlayerPickCallback): void;
    once(event: "champ-select-local-player-pick-completed", callback: ChampSelectLocalPlayerPickCompletedCallback): void;
    once(event: "game-flow-phase-change", callback: GameFlowPhaseChangeCallback): void;
    once(event: "runes-reloaded", callback: RunesReloadedCallback): void;

    once(event: LCA.LCAEvent, callback: (...args: any[]) => void) {
        if (!this.oneTimeEventHandlers.has(event))
            this.oneTimeEventHandlers.set(event, []);

        this.oneTimeEventHandlers.get(event)?.push(callback);
    }

    private eventHandlers = new Map<string, ((...args: any[]) => void)[]>();
    private oneTimeEventHandlers = new Map<string, ((...args: any[]) => void)[]>();
    private emit(event: LCA.LCAEvent, ...args: any[]) {
        this.eventHandlers.get(event)?.forEach(callback => callback.apply(null, args));
        this.oneTimeEventHandlers.get(event)?.forEach(callback => callback.apply(null, args));
        this.oneTimeEventHandlers.clear()
    }

    //#region Connection
    /**
     * Asynchronously connects to the League of Legends client
     */
    async connect() {
        if (this.isConnected) return;

        this.webSocket = null;
        this.port = null;
        this.authToken = null;
        this.httpClient = null;

        await new Promise(
            (resolve, reject) => {
                exec('wmic PROCESS WHERE name=\'LeagueClientUx.exe\' GET commandline', (error, stdout, stderr) => {
                    let portArr = stdout.match("--app-port=([0-9]*)");
                    let passArr = stdout.match("--remoting-auth-token=([\\w-]*)");

                    if (portArr !== null && passArr !== null && (portArr?.length ?? 0) === 2 && (passArr?.length ?? 0) === 2) {
                        resolve({ port: Number(portArr[1]), authToken: String(passArr[1]) });
                    } else {
                        reject();
                    }
                });
            }
        ).then((data: any) => {
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
            }
            ws.onclose = async (ev) => {
                this.isConnected = false;
                this.emit("connection-state-change", false);

                await delay(2500);
                if (this.autoReconnect)
                    this.connect()
            }
            ws.onerror = (ev) => {
                //SUPRESSES CONSOLE ERRORS
            }
            ws.onmessage = (ev) => {
                try {
                    let data = JSON.parse(ev.data.toString('utf8'));
                    if (data.length == 3) this.onSubscribedEvent(data);
                } catch (ex) { }
            }
        }, async err => {
            await delay(2500);
            if (this.autoReconnect)
                this.connect()
        });
    }

    disconnect() {

    }

    subscribeEvent(eventName: LCA.LCUEvent) {
        if (this.webSocket !== null && this.webSocket.readyState === 1) {
            this.webSocket.send(JSON.stringify([5, eventName]));
        }
    }

    unsubscribeEvent(eventName: LCA.LCUEvent) {
        if (this.webSocket !== null && this.webSocket.readyState === 1) {
            this.webSocket.send(JSON.stringify([6, eventName]));
        }
    }
    /**
     * 
     * @param {[opcode: number, name: string, data: {eventType: string, uri: string, data: {}}]} event 
     */
    onSubscribedEvent(event: [opcode: number, name: string, data: { eventType: string; uri: string; data: any; }]) {
        let value = event[2];
        let eventType = value.eventType;
        let uri = value.uri;
        let data = value.data;

        const Events = LCA.LCUEvent;

        switch (event[1]) {
            case Events.GameFlowPhase: {
                if (this.gameFlowPhase !== data) {
                    this.eventHandlers.get("game-flow-phase-change")?.forEach(callback => callback(this.gameFlowPhase, data));
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
                            this.emit("champ-select-local-player-pick")
                        }
                        if (session.getActionById(session.ownPickActionId).completed && !this.champSelectSession.getActionById(session.ownPickActionId).completed) {
                            this.emit("champ-select-local-player-pick-completed", session.getActionById(session.ownPickActionId).championId);
                        }
                    } else {
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
        if (this.httpClient === null) return;

        let request = this.httpClient.createRequest("POST", "/lol-lobby-team-builder/v1/ready-check/accept");
        request.send(response => { }).end();
    }

    /**
     * Declines a ready check
     */
    declineMatch() {
        if (this.httpClient === null) return;

        let request = this.httpClient.createRequest("POST", "/lol-lobby-team-builder/v1/ready-check/decline");
        request.send(response => { }).end();
    }
    //#endregion

    //#region Champ Select
    /**
     * Declares intent to pick given champion
     * @param id The champion's id
     */
    declarePickIntent(id: number | string) {
        if (this.httpClient === null) return;
        if (this.champSelectSession === null) return;

        let request = this.httpClient.createRequest("PATCH", "/lol-lobby-team-builder/champ-select/v1/session/actions/" + this.champSelectSession.ownPickActionId);
        request.setHeader("Content-Type", "application/json");
        let req = request?.send((response) => { });
        req.write(JSON.stringify({ championId: Number(id) }));
        req.end();
    }

    /**
     * Declares intent to ban given champion
     * @param id The champion's id
     */
    declareBanIntent(id: number | string) {
        if (this.httpClient === null) return;
        if (this.champSelectSession === null) return;

        let request = this.httpClient.createRequest("PATCH", "/lol-lobby-team-builder/champ-select/v1/session/actions/" + this.champSelectSession.ownBanActionId);
        request.setHeader("Content-Type", "application/json");
        let req = request?.send((response) => { });
        req.write(JSON.stringify({ championId: Number(id) }));
        req.end();
    }

    /**
     * Locks the champion pick
     */
    lockPick() {
        if (this.httpClient === null) return;
        if (this.champSelectSession === null) return;

        this.httpClient.createRequest("POST", "/lol-lobby-team-builder/champ-select/v1/session/actions/" + this.champSelectSession.ownPickActionId + "/complete").send(res => { }).end();
    }

    /**
     * Locks the champion ban
     */
    lockBan() {
        if (this.httpClient === null) return;
        if (this.champSelectSession === null) return;

        this.httpClient.createRequest("POST", "/lol-lobby-team-builder/champ-select/v1/session/actions/" + this.champSelectSession.ownBanActionId + "/complete").send(res => { }).end();
    }
    //#endregion

    //#region Runes
    /**
     * @returns The currently active rune page or null, if not found
     */
    getActiveRunePage(): RunePage | null {
        let rp = null;
        this.runePages.forEach(page => {
            if (page.current) rp = page;
        });

        return rp;
    }

    /**
     * Retrieves the rune pages from the client
     */
    updateRunePages(callback: ((runePages: RunePage[]) => void) | undefined = undefined): void {
        if (this.httpClient === null) return;

        let req = this.httpClient.createRequest('GET', '/lol-perks/v1/pages').send((res) => {
            var body: any[] = [];
            res.on('data', (chunk: any) => {
                body.push(chunk);
            });
            res.on('end', () => {
                try {
                    body = JSON.parse(Buffer.concat(body).toString());
                } catch (e) {
                    return;
                }

                this.runePages = body.map(entry => new RunePage(entry));

                if (typeof callback === 'function') callback(this.runePages);
                this.emit("runes-reloaded", this.runePages);
            });
        });

        req.end();
    }

    /**
     * @returns An array of editable rune pages
     */
    getEditableRunePages(): RunePage[] {
        let pages: RunePage[] = [];
        this.runePages.forEach(page => {
            if (page.isEditable) pages.push(page);
        });
        return pages;
    }

    /**  
     * Sets a rune page as the active rune page
     * @param id The rune page's id
     */
    setActiveRunePage(id: number | string): void {
        if (this.httpClient === null) return;

        let request = this.httpClient.createRequest("PUT", "/lol-perks/v1/currentpage");
        let req = request.send((response) => { this.updateRunePages() });
        req.write(String(id));
        req.end();
    }

    /**  
     * Deletes a rune page
     * @param id The rune page's id
     */
    deleteRunePage(id: number | string): void {
        if (this.httpClient === null) return;

        let request = this.httpClient.createRequest("DELETE", "/lol-perks/v1/pages/" + id);
        let req = request.send((response) => { this.updateRunePages() });
        req.end();
    }

    /**
     * Creates a rune page in the client
     * @param page The rune page
     */
    createRunePage(page: RunePage): void {
        if (this.httpClient === null) return;

        let request = this.httpClient.createRequest("POST", "/lol-perks/v1/pages");
        request.setHeader('Content-Type', 'application/json');
        let req = request.send((response) => { this.updateRunePages() });
        req.write(JSON.stringify(page));
        req.end();
    }

    /**
     * Searches for a rune page with a certain id
     * @param id The id to search for 
     */
    getRunePageById(id: number | string): RunePage | null {
        return this.runePages.find(page => page.id === Number(id)) ?? null;
    }
    //#endregion
}