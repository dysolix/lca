import nodeHttps from 'https';
import LeagueData from "./Data";
import GameFlowPhase from './Types/GameFlowPhase';
import https from "./Https";
import ChampSelectSession from './Types/ChampSelectSession';
import RunePage from './Types/RunePage';
import ChampSelectPhase from './Types/ChampSelectPhase';
import LCAEvent from './Types/LCAEvent';
import { exec } from "child_process";
import WebSocket from "ws";
import LCUEvent from './Types/LCUEvent';

type ConnectionStateChangeCallback = (state: boolean) => void;

type ChampSelectSessionUpdateCallback = () => void;
type ChampSelectPhaseChangeCallback = (previousPhase: ChampSelectPhase, phase: ChampSelectPhase) => void;
type ChampSelectLocalPlayerBanCallback = () => void;
type ChampSelectLocalPlayerPickCallback = () => void;
type ChampSelectLocalPlayerPickCompletedCallback = (championId: number) => void;

type GameFlowPhaseChangeCallback = (previousPhase: GameFlowPhase, phase: GameFlowPhase) => void;

type RunesReloadedCallback = (runes: RunePage[]) => void;

namespace LCA {
    export class Client {
        isConnected: boolean = false;
        webSocket: WebSocket = null;
        port: number = null;
        authToken: string = null;
        httpClient: https.Client = null;
        gameFlowPhase: GameFlowPhase = "None";
        runePages: RunePage[] = [];
        champSelectSession: ChampSelectSession = null;
        eventNames: any;
    
        constructor() {
            window["leagueClient"] = this;
        }
    
        on(event: "connection-state-change", callback: ConnectionStateChangeCallback): void;
        on(event: "champ-select-session-update", callback: ChampSelectSessionUpdateCallback): void;
        on(event: "champ-select-phase-change", callback: ChampSelectPhaseChangeCallback): void;
        on(event: "champ-select-local-player-ban", callback: ChampSelectLocalPlayerBanCallback): void;
        on(event: "champ-select-local-player-pick", callback: ChampSelectLocalPlayerPickCallback): void;
        on(event: "champ-select-local-player-pick-completed", callback: ChampSelectLocalPlayerPickCompletedCallback): void;
        on(event: "game-flow-phase-change", callback: GameFlowPhaseChangeCallback): void;
        on(event: "runes-reloaded", callback: RunesReloadedCallback): void;
    
        on(event: LCAEvent, callback: (...args: any[]) => void){
            if(!this.eventHandlers.has(event)) 
                this.eventHandlers.set(event, []);
    
            this.eventHandlers.get(event).push(callback);
        }

        once(event: "connection-state-change", callback: ConnectionStateChangeCallback): void;
        once(event: "champ-select-session-update", callback: ChampSelectSessionUpdateCallback): void;
        once(event: "champ-select-phase-change", callback: ChampSelectPhaseChangeCallback): void;
        once(event: "champ-select-local-player-ban", callback: ChampSelectLocalPlayerBanCallback): void;
        once(event: "champ-select-local-player-pick", callback: ChampSelectLocalPlayerPickCallback): void;
        once(event: "champ-select-local-player-pick-completed", callback: ChampSelectLocalPlayerPickCompletedCallback): void;
        once(event: "game-flow-phase-change", callback: GameFlowPhaseChangeCallback): void;
        once(event: "runes-reloaded", callback: RunesReloadedCallback): void;
    
        once(event: LCAEvent, callback: (...args: any[]) => void){
            if(!this.oneTimeEventHandlers.has(event)) 
                this.oneTimeEventHandlers.set(event, []);
    
            this.oneTimeEventHandlers.get(event).push(callback);
        }
    
        private eventHandlers = new Map<string, ((...args: any[]) => void)[]>();
        private oneTimeEventHandlers = new Map<string, ((...args: any[]) => void)[]>();
        private handleEvent(event: LCAEvent, ...args: any[]){
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
                        let port = null;
                        let password = null;
            
                        if ((portArr?.length ?? 0) === 2 && (passArr?.length ?? 0) === 2) {
                            port = portArr[1];
                            password = passArr[1];
    
                            resolve({port: Number(port), authToken: String(password)});
                        }else{
                            reject();
                        }        
                    });
                }
            ).then((data : any) => {
                let port = data.port;
                let password = data.authToken;
    
                let authToken = Buffer.from(("riot:" + password)).toString("base64");
                let ws = new WebSocket(("wss://127.0.0.1:" + port), null, { headers: { Authorization: "Basic " + authToken }, rejectUnauthorized: false });
    
                ws.onopen = (ev) => {
                    this.isConnected = true;
                    this.webSocket = ws;
                    this.port = port;
                    this.authToken = authToken;
                    this.handleEvent("connection-state-change", true);
    
                    this.httpClient = new https.Client("127.0.0.1", port, { 'Authorization': "Basic " + authToken });
    
                    // EVENTS
                    for (let eventName of Object.values(LCUEvent))
                        this.subscribeEvent(eventName);
    
                    setTimeout(() => this.updateRunePages(), 2500);
                }
                ws.onclose = (ev) => {
                    this.isConnected = false;
                    setTimeout(() => this.connect(), 2500);
                    this.handleEvent("connection-state-change", false);
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
            }, err => setTimeout(() => this.connect(), 2500));
        }
    
        subscribeEvent(eventName: LCUEvent) {
            if (this.webSocket !== null && this.webSocket.readyState === 1) {
                this.webSocket.send(JSON.stringify([5, eventName]));
            }
        }
    
        unsubscribeEvent(eventName: LCUEvent) {
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
    
            switch (event[1]) {
                case this.eventNames.gameFlowPhase: {
                    if (this.gameFlowPhase !== data) {
                        this.eventHandlers.get("game-flow-phase-change")?.forEach(callback => callback(this.gameFlowPhase, data));
                        this.gameFlowPhase = data;
                    }
    
                    break;
                }
    
                case this.eventNames.teamBuilderChampSelect: {
                    if (uri === "/lol-lobby-team-builder/champ-select/v1/session") {
                        if (eventType === "Delete") {
                            this.champSelectSession = null;
                            this.handleEvent("champ-select-session-update");
                            return;
                        }
    
                        let session = new ChampSelectSession(data);
    
                        if (this.champSelectSession !== null) {
                            if (session.getPhase() !== this.champSelectSession.getPhase()) {
                                this.handleEvent("champ-select-phase-change", this.champSelectSession.getPhase(), session.getPhase());
                            }
                            if (session.getPhase() === "BAN" && this.champSelectSession.getPhase() === "INTENT") {
                                this.handleEvent("champ-select-local-player-ban");
                            }
                            if (session.inProgressActionIds.includes(session.ownPickActionId) && !this.champSelectSession.inProgressActionIds.includes(session.ownPickActionId)) {
                                this.handleEvent("champ-select-local-player-pick")
                            }
                            if (session.getActionById(session.ownPickActionId).completed && !this.champSelectSession.getActionById(session.ownPickActionId).completed) {
                                this.handleEvent("champ-select-local-player-pick-completed", session.getActionById(session.ownPickActionId).championId);
                            }
                        } else {
                            this.handleEvent("champ-select-phase-change", "NONE", session.getPhase());
                        }
    
                        this.champSelectSession = session;
                        this.handleEvent("champ-select-session-update");
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
            let request = this.httpClient.createRequest("POST", "/lol-lobby-team-builder/v1/ready-check/accept");
            request.send(response => { }).end();
        }
    
        /**
         * Declines a ready check
         */
        declineMatch() {
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
            let request = this.httpClient.createRequest("PATCH", "/lol-lobby-team-builder/champ-select/v1/session/actions/" + this.champSelectSession.ownPickActionId);
            request.setHeader("Content-Type", "application/json");
            let req = request.send((response) => { });
            req.write(JSON.stringify({ championId: Number(id) }));
            req.end();
        }
    
        /**
         * Declares intent to ban given champion
         * @param id The champion's id
         */
        declareBanIntent(id: number | string) {
            let request = this.httpClient.createRequest("PATCH", "/lol-lobby-team-builder/champ-select/v1/session/actions/" + this.champSelectSession.ownBanActionId);
            request.setHeader("Content-Type", "application/json");
            let req = request.send((response) => { });
            req.write(JSON.stringify({ championId: Number(id) }));
            req.end();
        }
    
        /**
         * Locks the champion pick
         */
        lockPick() {
            this.httpClient.createRequest("POST", "/lol-lobby-team-builder/champ-select/v1/session/actions/" + this.champSelectSession.ownPickActionId + "/complete").send(res => { }).end();
        }
    
        /**
         * Locks the champion ban
         */
        lockBan() {
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
         * @param {(runePages: RunePage[]) => void} callback
         */
        updateRunePages(callback: (runePages: RunePage[]) => void = undefined): void {
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
    
                    if(typeof callback === 'function') callback(this.runePages);
                    this.handleEvent("runes-reloaded", this.runePages);
                });
            });
    
            req.end();
        }
    
        /**
         * @returns An array of editable rune pages
         */
        getEditableRunePages(): RunePage[] {
            let pages = [];
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
            let request = this.httpClient.createRequest("DELETE", "/lol-perks/v1/pages/" + id);
            let req = request.send((response) => { this.updateRunePages() });
            req.end();
        }
    
        /**
         * Creates a rune page in the client
         * @param page The rune page
         */
        createRunePage(page: RunePage): void {
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
        getRunePageById(id: number | string): RunePage {
            return this.runePages.find(page => page.id === Number(id)) ?? null;
        }
        //#endregion
    };

    export const Data = LeagueData;

    export const Util = {
        /**
         * Simple https get request
         * @param url 
         * @returns The response string or null
         */
        httpsGet(url: string) : Promise<string | null> {
            return new Promise((resolve, reject) => {
                nodeHttps.get(url, res => {
                    var resBody = [];
        
                    res.setEncoding('utf8');
                    res.on('data', data => resBody.push(data));
                    res.on('end', () => resolve(resBody.join("")));
                    res.on('error', (err) => reject());
                });
            }).then(value => value, err => null);
        },

        /**
         * Compares two patch versions
         * @returns true, if the first patch is newer 
         */
        isPatchNewer(firstPatch: string, secondPatch: string) : boolean {
            let firstPatchArr = firstPatch.split(".").map(n => Number(n));
            let secondPatchArr = secondPatch.split(".").map(n => Number(n));
        
            for (let i = 0; i < firstPatchArr.length; i++) {
                if (firstPatchArr[i] > secondPatchArr[i])
                    return true;
                if (firstPatchArr[i] < secondPatchArr[i])
                    return false;
            }
        
            return true;
        }
    }
}

export default LCA;