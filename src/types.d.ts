declare namespace LCA {
    type Nullable<T> = T | null;

    type DataKey = {}

    type RunePage = import("./Classes/RunePage").default;

    type ChampSelectSession = import("./Classes/ChampSelectSession").default;

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