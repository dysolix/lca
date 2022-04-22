var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { httpsGet } from "./Util.js";
class DataHandler {
    constructor() {
        this.values = [];
        this.isLoaded = () => this.values.length !== 0;
        this.load = (data, options) => __awaiter(this, void 0, void 0, function* () {
            if (data !== null) {
                this.values = data;
            }
            else {
                this.values = yield this.downloadData(options);
            }
        });
    }
}
const Data = {
    init({ data = {}, options = {} } = { data: {}, options: {} }) {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function* () {
            options.server = (_a = options.server) !== null && _a !== void 0 ? _a : "euw";
            options.language = (_b = options.language) !== null && _b !== void 0 ? _b : "en_US";
            options.requireLatestData = (_c = options.requireLatestData) !== null && _c !== void 0 ? _c : true;
            this.latestPatch = yield this.getLatestPatch(options.server);
            if (this.latestPatch === null) {
                if (options.requireLatestData)
                    throw new Error("Unable to retrieve latest patch.");
            }
            this.dataPatch = (_d = data.version) !== null && _d !== void 0 ? _d : null;
            let promises = [];
            let targetDataVersion = options.requireLatestData ? Data.latestPatch : ((_e = data.version) !== null && _e !== void 0 ? _e : null);
            if (targetDataVersion == null)
                throw new Error("Invalid target data version: " + targetDataVersion);
            Data.dataPatch = targetDataVersion;
            Object.entries(Data).forEach(([key, val]) => {
                var _a, _b;
                if (val instanceof DataHandler) {
                    let dataKey = key.charAt(0).toLowerCase() + key.substring(1);
                    if (!((_b = (_a = options.requiredData) === null || _a === void 0 ? void 0 : _a.includes(dataKey)) !== null && _b !== void 0 ? _b : true))
                        return;
                    let dataValues = (options.requireLatestData && Data.latestPatch !== data.version) ? null : data[dataKey];
                    if (dataValues === null)
                        Data.wasUpdated = true;
                    promises.push(val.load(dataValues, options));
                }
            });
            yield Promise.all(promises).catch(err => {
                throw new Error("Error while loading data: " + err);
            });
        });
    },
    /**
     *
     * @returns {LCA.DataObject} Data object that can be stored and passed into the init method
     */
    getDataObject() {
        let dataObject = {};
        if (this.dataPatch !== null)
            dataObject.version = this.dataPatch;
        Object.entries(this).forEach(([key, value]) => {
            var _a;
            if (((_a = value === null || value === void 0 ? void 0 : value.values) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                dataObject[key] = value.values;
            }
        });
        return dataObject;
    },
    /** Latest patch  */
    latestPatch: null,
    dataPatch: null,
    wasUpdated: false,
    getDataDragonUrl(language = "en_US", patch = undefined, file = "") {
        return `https://ddragon.leagueoflegends.com/cdn/${(patch !== null && patch !== void 0 ? patch : this.latestPatch)}/data/${language}/${file}`;
    },
    getStaticDataUrl(file = "") {
        return `https://static.developer.riotgames.com/docs/lol/${file}`;
    },
    /**
     * @param server Server region, defaults to "euw"
     * @returns The latest patch for given server region
     */
    getLatestPatch(server = "euw") {
        return __awaiter(this, void 0, void 0, function* () {
            let responseString = yield httpsGet(`https://ddragon.leagueoflegends.com/realms/${server}.json`);
            if (responseString == null)
                return null;
            let realmData = JSON.parse(responseString);
            return realmData.dd;
        });
    },
    Champions: new class Champions extends DataHandler {
        constructor() {
            super(...arguments);
            this.downloadData = (options) => __awaiter(this, void 0, void 0, function* () { var _a, _b; return JSON.parse((_b = yield httpsGet(`${Data.getDataDragonUrl(options.language, (_a = Data.dataPatch) !== null && _a !== void 0 ? _a : undefined, "champion.json")}`)) !== null && _b !== void 0 ? _b : "").data; });
        }
        /**
         * @param identifier The champions display name, internal name or key
         * @returns The champion corresponding to the passed identifier
         */
        getChampion(identifier) {
            var _a, _b;
            if (!isNaN(identifier)) {
                return (_a = this.values.find(champion => champion.key == identifier)) !== null && _a !== void 0 ? _a : null;
            }
            else {
                return (_b = this.values.find(champion => champion.id === identifier || champion.name === identifier)) !== null && _b !== void 0 ? _b : null;
            }
        }
    },
    SummonerSpells: new class SummonerSpells extends DataHandler {
        constructor() {
            super(...arguments);
            this.downloadData = (options) => __awaiter(this, void 0, void 0, function* () { var _a, _b; return JSON.parse((_b = yield httpsGet(`${Data.getDataDragonUrl(options.language, (_a = Data.dataPatch) !== null && _a !== void 0 ? _a : undefined, "summoner.json")}`)) !== null && _b !== void 0 ? _b : "").data; });
        }
    },
    Runes: new class Runes extends DataHandler {
        constructor() {
            super(...arguments);
            this.downloadData = (options) => __awaiter(this, void 0, void 0, function* () { var _a, _b; return JSON.parse((_b = yield httpsGet(Data.getDataDragonUrl(options.language, (_a = Data.dataPatch) !== null && _a !== void 0 ? _a : undefined, "runesReforged.json"))) !== null && _b !== void 0 ? _b : ""); });
        }
        getRune(identifier) {
            var predicate;
            if (!isNaN(identifier)) {
                predicate = rune => rune.id == identifier;
            }
            else {
                predicate = rune => rune.key == identifier || rune.name == identifier;
            }
            for (const runeTree of this.values) {
                for (const runeSlot of runeTree.slots) {
                    let rune = runeSlot.runes.find(predicate);
                    if (rune !== undefined)
                        return rune;
                }
            }
            return null;
        }
        getRuneTree(identifier) {
            var _a;
            var predicate;
            if (!isNaN(identifier)) {
                predicate = runeTree => runeTree.id == identifier;
            }
            else {
                predicate = runeTree => runeTree.key == identifier || runeTree.name == identifier;
            }
            return (_a = this.values.find(predicate)) !== null && _a !== void 0 ? _a : null;
        }
        getRuneTreeByRune(rune) {
            var _a;
            if (typeof rune === "string" || typeof rune === "number") {
                let r = this.getRune(rune);
                if (r === null)
                    return null;
                rune = r;
            }
            return (_a = this.values.find(runeTree => runeTree.slots.some(runeSlot => runeSlot.runes.some(rune => rune.id === rune.id)))) !== null && _a !== void 0 ? _a : null;
        }
    },
    Queues: new class Queues extends DataHandler {
        constructor() {
            super(...arguments);
            this.downloadData = () => __awaiter(this, void 0, void 0, function* () { var _a; return JSON.parse((_a = yield httpsGet(`${Data.getStaticDataUrl("queues.json")}`)) !== null && _a !== void 0 ? _a : ""); });
        }
        getQueue(identifier) {
            return this.values.find(q => q.queueId == identifier);
        }
        getQueuesByMap(map) {
            return this.values.filter(q => q.map == map);
        }
    },
    Maps: new class Maps extends DataHandler {
        constructor() {
            super(...arguments);
            this.downloadData = () => __awaiter(this, void 0, void 0, function* () { var _a; return JSON.parse((_a = yield httpsGet(`${Data.getStaticDataUrl("maps.json")}`)) !== null && _a !== void 0 ? _a : ""); });
        }
    },
    GameModes: new class GameModes extends DataHandler {
        constructor() {
            super(...arguments);
            this.downloadData = () => __awaiter(this, void 0, void 0, function* () { var _a; return JSON.parse((_a = yield httpsGet(`${Data.getStaticDataUrl("gameModes.json")}`)) !== null && _a !== void 0 ? _a : ""); });
        }
    },
    GameTypes: new class GameTypes extends DataHandler {
        constructor() {
            super(...arguments);
            this.downloadData = () => __awaiter(this, void 0, void 0, function* () { var _a; return JSON.parse((_a = yield httpsGet(`${Data.getStaticDataUrl("gameTypes.json")}`)) !== null && _a !== void 0 ? _a : ""); });
        }
    }
};
export default Data;
