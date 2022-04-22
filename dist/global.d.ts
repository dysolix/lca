declare namespace LCA {
    type Nullable<T> = T | null;

    type DataKey = "Champions" | "SummonerSpells" | "Runes" | "Queues" | "Maps" | "GameModes" | "GameTypes"

    type RunePage = import("Classes/RunePage").default;

    type ChampSelectSession = import("Classes/ChampSelectSession").default;

    type ChampSelectPhase = 'NONE' | 'INTENT' | 'BAN' | 'PICK' | 'FINALIZE';

    type Champion = {
        version: string;
        id: string;
        key: string;
        name: string;
        title: string;
        blurb: string;
        info: ChampionInfo;
        image: ImageData;
        tags: ChampionTag[];
        partype: ChampionPartype;
        stats: ChampionStats;
    };

    type ChampionInfo = {
        attack: number;
        defense: number;
        magic: number;
        difficulty: number;
    };

    type ChampionPartype = "None" | "Mana" | "Energy" | "Blood Well" | "Fury" | "Ferocity" | "Heat" | "Grit" | "Crimson Rush" | "Flow" | "Shield";

    type ChampionStats = {
        hp: number;
        hpperlevel: number;
        mp: number;
        mpperlevel: number;
        movespeed: number;
        armor: number;
        armorperlevel: number;
        spellblock: number;
        spellblockperlevel: number;
        attackrange: number;
        hpregen: number;
        hpregenperlevel: number;
        mpregen: number;
        mpregenperlevel: number;
        crit: number;
        critperlevel: number;
        attackdamage: number;
        attackdamageperlevel: number;
        attackspeedperlevel: number;
        attackspeed: number;
    };

    type ChampionTag = "Fighter" | "Tank" | "Mage" | "Assassin" | "Support" | "Marksman";

    type DataInitOptions = {
        requireLatestData?: boolean;
        server?: ServerRegion;
        language?: LanguageCode;
        requiredData?: DataKey[];
        dataVersion?: string;
    };

    type DataObject = {
        [key: string]: any;
        version?: string;
        champions?: Champion[];
        summonerSpells?: [];
        queues?: GameQueue[];
        gameModes?: GameMode[];
        maps?: GameMap[];
        gameTypes?: GameType[];
    };

    type GameFlowPhase = 'None' | 'Lobby' | 'ChampSelect' | 'GameStart' | 'InProgress' | 'WaitingForStats';

    type GameMap = {
        mapId: number;
        mapName: string;
        notes: string;
    };

    type GameMode = {
        gameMode: string;
        description: string;
    };

    type GameQueue = {
        queueId: number;
        map: string;
        description: string;
        notes: string;
    };

    type GameType = {
        gameType: string;
        description: string;
    };

    type ImageData = {
        full: string;
        sprite: string;
        group: string;
        x: number;
        y: number;
        w: number;
        h: number;
    };

    type LCAEvent = "connection-state-change" | "champ-select-session-update" | "champ-select-phase-change" | "champ-select-local-player-ban" | "champ-select-local-player-pick" | "champ-select-local-player-pick-completed" | "game-flow-phase-change" | "runes-reloaded" | "subscribed-event";

    enum LCUEvent {
        GameFlowPhase = "OnJsonApiEvent_lol-gameflow_v1_gameflow-phase",
        TeamBuilderChampSelect = "OnJsonApiEvent_lol-lobby-team-builder_champ-select_v1"
    }

    type LanguageCode = "en_US" | "cs_CZ" | "de_DE" | "el_GR" | "en_AU" | "en_GB" | "en_PH" | "en_SG" | "es_AR" | "es_ES" | "es_MX" | "fr_FR" | "hu_HU" | "id_ID" | "it_IT" | "ja_JP" | "ko_KR" | "pl_PL" | "pt_BR" | "ro_RO" | "ru_RU" | "th_TH" | "tr_TR" | "vn_VN" | "zh_CN" | "zh_MY" | "zh_TW";

    type Rune = {
        id: number;
        key: string;
        icon: string;
        name: string;
        shortDesc: string;
        longDesc: string;
    };

    type RuneTree = {
        id: number;
        key: string;
        icon: string;
        name: string;
        slots: RuneSlot[];
    };

    type RuneSlot = {
        runes: Rune[];
    };

    type ServerRegion = "euw" | "eune" | "br" | "lan" | "las" | "na" | "oce" | "ru" | "jp" | "tr" | "kr" | "pbe";

    type SummonerSpell = {
        id: string;
        name: string;
        description: string;
        tooltip: string;
        maxrank: number;
        cooldown: number[];
        cooldownBurn: string;
        cost: number[];
        costBurn: string;
        datavalues: {};
        effect: number[][];
        effectBurn: string[];
        vars: any[];
        key: string;
        summonerLevel: number;
        modes: string[];
        costType: string;
        maxammo: string;
        range: number[];
        rangeBurn: string;
        image: ImageData;
        resource: string;
    };

    type ConnectionStateChangeCallback = (state: boolean) => void;
    type ChampSelectSessionUpdateCallback = () => void;
    type ChampSelectPhaseChangeCallback = (previousPhase: LCA.ChampSelectPhase, phase: LCA.ChampSelectPhase) => void;
    type ChampSelectLocalPlayerBanCallback = () => void;
    type ChampSelectLocalPlayerPickCallback = () => void;
    type ChampSelectLocalPlayerPickCompletedCallback = (championId: number) => void;
    type GameFlowPhaseChangeCallback = (previousPhase: LCA.GameFlowPhase, phase: LCA.GameFlowPhase) => void;
    type RunesReloadedCallback = (runes: LCA.RunePage[]) => void;
    type SubscribedEventCallback = (event: [opcode: number, name: string, data: {
        eventType: string;
        uri: string;
        data: any;
    }]) => void;

    type HttpsRequest = {
        options: HttpsRequestOptions;
        setHeader: (headerName: string, headerValue: any) => void;
        send: (callback: (response: import("http").IncomingMessage) => void) => import("http").ClientRequest;
    };

    type HttpsRequestOptions = {
        hostname: string;
        port: number;
        method?: string;
        path?: string;
        headers: {
            [key: string]: any;
        };
        agent: import("https").Agent | boolean;
    };

    type ChampSelectSessionData = {
        actions: [];
        allowBattleBoost: boolean;
        allowDuplicatePicks: boolean;
        allowLockedEvents: boolean;
        allowRerolling: boolean;
        allowSkinSelection: boolean;
        benchChampionIds: number[];
        benchEnabled: boolean;
        boostableSkinCount: number;
        chatDetails: {
            chatRoomName: string,
            chatRoomPassword: string
        };
        counter: number;
        entitledFeatureState: {
            additionalRerolls: number,
            unlockedSkinIds: number[]
        };
        gameId: number;
        hasSimultaneousBans: boolean;
        hasSimultaneousPicks: boolean;
        isSpectating: boolean;
        localPlayerCellId: number;
        lockedEventIndex: number;
        myTeam: ChampSelectTeamMember[];
        recoveryCounter: number;
        rerollsRemaining: number;
        skipChampionSelect: boolean;
        theirTeam: ChampSelectTeamMember[];
        timer: {
            adjustedTimeLeftInPhase: number,
            internalNowInEpochMs: number,
            isInfinite: true,
            phase: string,
            totalTimeInPhase: number
        };
        trades: {
            cellId: number,
            id: number,
            state: string
        }[];
    }

    type ChampSelectTeamMember = {
        assignedPosition: string,
        cellId: number,
        championId: number,
        championPickIntent: number,
        entitledFeatureType: string,
        playerType: string,
        selectedSkinId: number,
        spell1Id: number,
        spell2Id: number,
        summonerId: number,
        team: number,
        wardSkinId: number
    }
}
/// <reference types="node" />
declare module "HttpsClient" {
    import * as https from "https";
    export default class HttpsClient {
        hostname: string;
        port: number;
        defaultHeaders: {};
        agent: (boolean | https.Agent);
        constructor(hostname: string, port?: number, defaultHeaders?: {});
        getOptions(): LCA.HttpsRequestOptions;
        createRequest(method: string, path: string): LCA.HttpsRequest;
    }
}
declare module "Util" {
    /**
    * Simple https get request
    * @param url
    * @returns The response string or null
    */
    export function httpsGet(url: string): Promise<string | null>;
    /**
     * Compares two patch versions
     * @returns true, if the first patch is newer
     */
    export function isPatchNewer(firstPatch: string, secondPatch: string): boolean;
    /**
     * @param delay Delay in milliseconds
     * @returns A Promise that fulfills after given delay
     */
    export function delay(delay: number): Promise<void>;
}
declare module "Classes/ChampSelectSession" {
    export default class ChampSelectSession {
        data: any;
        ownBanActionId: number;
        ownPickActionId: number;
        inProgressActionIds: number[];
        constructor(data: LCA.ChampSelectSessionData);
        getPickedChampionIds(): number[];
        getBannedChampionIds(): number[];
        getPhase(): "INTENT" | "PICK" | "BAN" | "FINALIZE" | "NONE";
        getActionById(id: number): any;
        getTenBansRevealActionId(): number | null;
        getTeamMemberByPosition(position: 'top' | 'jungle' | 'middle' | 'bottom' | 'utility' | string): any;
    }
}
declare module "Data" {
    const Data: {
        init({ data, options }?: {
            data?: LCA.DataObject | undefined;
            options: LCA.DataInitOptions;
        }): Promise<void>;
        /**
         *
         * @returns {LCA.DataObject} Data object that can be stored and passed into the init method
         */
        getDataObject(): LCA.DataObject;
        /** Latest patch  */
        latestPatch: LCA.Nullable<string>;
        dataPatch: LCA.Nullable<string>;
        wasUpdated: boolean;
        getDataDragonUrl(language?: LCA.LanguageCode, patch?: string | undefined, file?: string): string;
        getStaticDataUrl(file?: string): string;
        /**
         * @param server Server region, defaults to "euw"
         * @returns The latest patch for given server region
         */
        getLatestPatch(server?: string): Promise<string | null>;
        Champions: {
            downloadData: (options: LCA.DataInitOptions) => Promise<LCA.Champion[]>;
            /**
             * @param identifier The champions display name, internal name or key
             * @returns The champion corresponding to the passed identifier
             */
            getChampion(identifier: string | number): LCA.Champion | null;
            values: LCA.Champion[];
            isLoaded: () => boolean;
            load: (data: LCA.Champion[] | null, options?: LCA.DataInitOptions | undefined) => Promise<void>;
        };
        SummonerSpells: {
            downloadData: (options: LCA.DataInitOptions) => Promise<LCA.SummonerSpell[]>;
            values: LCA.SummonerSpell[];
            isLoaded: () => boolean;
            load: (data: LCA.SummonerSpell[] | null, options?: LCA.DataInitOptions | undefined) => Promise<void>;
        };
        Runes: {
            downloadData: (options: LCA.DataInitOptions) => Promise<LCA.RuneTree[]>;
            getRune(identifier: number | string): LCA.Rune | null;
            getRuneTree(identifier: number | string): LCA.RuneTree | null;
            getRuneTreeByRune(rune: LCA.Rune | string | number): LCA.RuneTree | null;
            values: LCA.RuneTree[];
            isLoaded: () => boolean;
            load: (data: LCA.RuneTree[] | null, options?: LCA.DataInitOptions | undefined) => Promise<void>;
        };
        Queues: {
            downloadData: () => Promise<LCA.GameQueue[]>;
            getQueue(identifier: number): LCA.GameQueue | undefined;
            getQueuesByMap(map: string): LCA.GameQueue[];
            values: LCA.GameQueue[];
            isLoaded: () => boolean;
            load: (data: LCA.GameQueue[] | null, options?: LCA.DataInitOptions | undefined) => Promise<void>;
        };
        Maps: {
            downloadData: () => Promise<LCA.GameMap[]>;
            values: LCA.GameMap[];
            isLoaded: () => boolean;
            load: (data: LCA.GameMap[] | null, options?: LCA.DataInitOptions | undefined) => Promise<void>;
        };
        GameModes: {
            downloadData: () => Promise<LCA.GameMode[]>;
            values: LCA.GameMode[];
            isLoaded: () => boolean;
            load: (data: LCA.GameMode[] | null, options?: LCA.DataInitOptions | undefined) => Promise<void>;
        };
        GameTypes: {
            downloadData: () => Promise<LCA.GameType[]>;
            values: LCA.GameType[];
            isLoaded: () => boolean;
            load: (data: LCA.GameType[] | null, options?: LCA.DataInitOptions | undefined) => Promise<void>;
        };
    };
    export default Data;
}
declare module "Classes/RunePage" {
    export default class RunePage {
        autoModifiedSelections: any[];
        current: boolean;
        id: number;
        isActive: boolean;
        isDeletable: boolean;
        isEditable: boolean;
        isValid: boolean;
        lastModified: number;
        name: string;
        order: number;
        selectedPerkIds: number[];
        private _primaryStyleId;
        private _subStyleId;
        constructor(data?: any);
        get primaryStyleId(): number | undefined;
        get subStyleId(): number | undefined;
        set primaryStyleId(value: number | undefined);
        set subStyleId(value: number | undefined);
        update(): void;
        toJSON(): this;
    }
}
declare module "Client" {
    import ChampSelectSession from "Classes/ChampSelectSession";
    import RunePage from "Classes/RunePage";
    type ConnectionStateChangeCallback = (state: boolean) => void;
    type ChampSelectSessionUpdateCallback = () => void;
    type ChampSelectPhaseChangeCallback = (previousPhase: LCA.ChampSelectPhase, phase: LCA.ChampSelectPhase) => void;
    type ChampSelectLocalPlayerBanCallback = () => void;
    type ChampSelectLocalPlayerPickCallback = () => void;
    type ChampSelectLocalPlayerPickCompletedCallback = (championId: number) => void;
    type GameFlowPhaseChangeCallback = (previousPhase: LCA.GameFlowPhase, phase: LCA.GameFlowPhase) => void;
    type RunesReloadedCallback = (runes: RunePage[]) => void;
    type SubscribedEventCallback = (event: [opcode: number, name: string, data: {
        eventType: string;
        uri: string;
        data: any;
    }]) => void;
    type Nullable<T> = LCA.Nullable<T>;
    global {
        interface Window {
            leagueClient: Client;
        }
    }
    export default class Client {
        isConnected: boolean;
        port: Nullable<number>;
        authToken: Nullable<string>;
        private webSocket;
        private httpClient;
        champSelectSession: Nullable<ChampSelectSession>;
        gameFlowPhase: LCA.GameFlowPhase;
        runePages: RunePage[];
        private autoReconnect;
        /**
         * @param autoReconnect Determines if the client should automatically try to reconnect if the connection closes. Defaults to true.
         */
        constructor(autoReconnect?: boolean);
        on(event: "connection-state-change", callback: ConnectionStateChangeCallback): void;
        on(event: "champ-select-session-update", callback: ChampSelectSessionUpdateCallback): void;
        on(event: "champ-select-phase-change", callback: ChampSelectPhaseChangeCallback): void;
        on(event: "champ-select-local-player-ban", callback: ChampSelectLocalPlayerBanCallback): void;
        on(event: "champ-select-local-player-pick", callback: ChampSelectLocalPlayerPickCallback): void;
        on(event: "champ-select-local-player-pick-completed", callback: ChampSelectLocalPlayerPickCompletedCallback): void;
        on(event: "game-flow-phase-change", callback: GameFlowPhaseChangeCallback): void;
        on(event: "runes-reloaded", callback: RunesReloadedCallback): void;
        /** This is called when the League of Legends client emits an event */
        on(event: "subscribed-event", callback: SubscribedEventCallback): void;
        once(event: "connection-state-change", callback: ConnectionStateChangeCallback): void;
        once(event: "champ-select-session-update", callback: ChampSelectSessionUpdateCallback): void;
        once(event: "champ-select-phase-change", callback: ChampSelectPhaseChangeCallback): void;
        once(event: "champ-select-local-player-ban", callback: ChampSelectLocalPlayerBanCallback): void;
        once(event: "champ-select-local-player-pick", callback: ChampSelectLocalPlayerPickCallback): void;
        once(event: "champ-select-local-player-pick-completed", callback: ChampSelectLocalPlayerPickCompletedCallback): void;
        once(event: "game-flow-phase-change", callback: GameFlowPhaseChangeCallback): void;
        once(event: "runes-reloaded", callback: RunesReloadedCallback): void;
        once(event: "subscribed-event", callback: SubscribedEventCallback): void;
        private eventHandlers;
        private oneTimeEventHandlers;
        private emit;
        /**
         * Asynchronously connects to the League of Legends client
         */
        connect(): Promise<void>;
        private subscribedEvents;
        subscribeEvent(eventName: LCA.LCUEvent | string): void;
        unsubscribeEvent(eventName: LCA.LCUEvent | string): void;
        private onSubscribedEvent;
        /**
         * Accepts a ready check
         */
        acceptMatch(): void;
        /**
         * Declines a ready check
         */
        declineMatch(): void;
        /**
         * Declares intent to pick given champion
         * @param id The champion's id
         */
        declarePickIntent(id: number | string): void;
        /**
         * Declares intent to ban given champion
         * @param id The champion's id
         */
        declareBanIntent(id: number | string): void;
        /**
         * Locks the champion pick
         */
        lockPick(): void;
        /**
         * Locks the champion ban
         */
        lockBan(): void;
        /**
         * @returns The currently active rune page or null, if not found
         */
        getActiveRunePage(): RunePage | null;
        /**
         * Retrieves the rune pages from the client
         */
        updateRunePages(callback?: ((runePages: RunePage[]) => void) | undefined): void;
        /**
         * @returns An array of editable rune pages
         */
        getEditableRunePages(): RunePage[];
        /**
         * Sets a rune page as the active rune page
         * @param id The rune page's id
         */
        setActiveRunePage(id: number | string): void;
        /**
         * Deletes a rune page
         * @param id The rune page's id
         */
        deleteRunePage(id: number | string): void;
        /**
         * Creates a rune page in the client
         * @param page The rune page
         */
        createRunePage(page: RunePage | string): void;
        /**
         * Searches for a rune page with a certain id
         * @param id The id to search for
         */
        getRunePageById(id: number | string): RunePage | null;
    }
}
declare module "@dysolix/lca" {
    export { default as Data } from "Data";
    export { default as Client } from "Client";
    export * as Util from "Util";
}
