import DataInitOptions from "./Types/DataInitOptions";
import DataObject from "./Types/DataObject";
import LCA from "./LCA";
import Queue from "./Types/Queue";
import Champion from "./Types/Champion";
import LanguageCode from "./Types/LanguageCode";

const httpsGet = LCA.Util.httpsGet;

export type DataKey = "champions" | "summonerSpells" | "queues" | "gameModes" | "maps" | "gameTypes" | string;

const Data = {
    async init({data = {}, options = {}}: {data?: DataObject, options: DataInitOptions} = {data: {}, options: {}}) {
        options.server = options.server ?? "euw";
        options.language = options.language ?? "en_US";
        options.requireLatestData = options.requireLatestData ?? true;

        this.latestPatch = await this.getLatestPatch(options.server);
        if (this.latestPatch === null) {
            if (options.requireLatestData)
                throw new Error("Unable to retrieve latest patch.");
        }

        options.dataVersion = data.version ?? null;
        this.dataPatch = options.dataVersion;

        let promises = [];

        let targetDataVersion = options.requireLatestData ? Data.latestPatch : (data.version ?? null);
        if (targetDataVersion == null) throw new Error("Invalid target data version: " + targetDataVersion);
        Data.dataPatch = targetDataVersion;

        Object.entries<(data: any, options: DataInitOptions) => void>(DataKeyMap).forEach(([key, loadFunc]) => {
            if(options.requiredData?.includes(key) ?? true){
                let dataValues = (options.requireLatestData && Data.latestPatch !== data.version) ? null : data[key];
                if(dataValues === null) Data.wasUpdated = true;

                promises.push(loadFunc(dataValues, options));
            }
        })

        await Promise.all(promises).catch(err => {
            throw new Error("Error while loading data: " + err);
        });

        window['data'] = Data;
    },

    /**
     * 
     * @returns {DataObject} Data object that can be stored and passed into the init method
     */
    getDataObject(): DataObject {
        let dataObject = { version: this.dataPatch };

        Object.entries<any>(this).forEach(([key, value]) => {
            if(value?.values?.length > 0){
                dataObject[key.charAt(0).toLowerCase() + key.substring(1)] = value.values;
            }
        });

        return dataObject;
    },

    /** Latest patch  */
    latestPatch: null,
    dataPatch: null,
    wasUpdated: false,

    /**
     * 
     * @param {LanguageCode} language 
     * @param {string} patch 
     * @returns {string} The data dragon url for given patch and language
     */
    getDataDragonUrl(language: LanguageCode = "en_US", patch: string = undefined, file = ""): string {
        return `https://ddragon.leagueoflegends.com/cdn/${(patch ?? this.latestPatch)}/data/${language}/${file}`;
    },

    getStaticDataUrl(file = "") {
        return `https://static.developer.riotgames.com/docs/lol/${file}`;
    },

    /**
     * 
     * @param {string} server Server region, defaults to "euw"
     * @returns {Promise<string>} The latest patch for given server region
     */
    async getLatestPatch(server: string = "euw"): Promise<string> {
        let responseString = await httpsGet(`https://ddragon.leagueoflegends.com/realms/${server}.json`);
        if (responseString == null) return null;
        let realmData = JSON.parse(responseString);
        return realmData.dd;
    },

    Champions: {
        /** @type {Champion[]} */
        values: [],
        fileName: "champion.json",

        /**
         * Loads the passed data or downloads new data
         * @param {Champion[] | undefined} data
         * @param {DataInitOptions} options
         */
        async load(data: Champion[] | undefined, options: DataInitOptions) {
            if (data == null) {
                this.values = JSON.parse(await httpsGet(`${Data.getDataDragonUrl(options.language, Data.dataPatch, this.fileName)}`)).data;
            } else {
                this.values = data;
            }
        },

        /**
         * @param {string | number} identifier The champions display name, internal name or key
         * @returns {Champion?} The champion corresponding to the passed identifier
         */
        getChampion(identifier: string | number | any): Champion | null {
            if (!isNaN(identifier)) {
                return this.values.find(champion => champion.key == identifier) ?? null;
            } else {
                return this.values.find(champion => champion.id === identifier || champion.name === identifier) ?? null;
            }
        }
    },

    SummonerSpells: {
        /** @type {[]} */
        values: [],
        fileName: "summoner.json",

        /**
         * Loads the passed data or downloads new data
         * @param {[] | undefined} data
         * @param {DataInitOptions} options
         */
        async load(data: [] | undefined, options: DataInitOptions) {
            if (data == null) {
                this.values = JSON.parse(await httpsGet(`${Data.getDataDragonUrl(options.language, Data.dataPatch, this.fileName)}`)).data;
            } else {
                this.values = data;
            }
        }
    },

    Queues: {
        /** @type {Queue[]} */
        values: [],
        fileName: "queues.json",

        async load(data, options) {
            if (data == null) {
                this.values = JSON.parse(await httpsGet(`${Data.getStaticDataUrl(this.fileName)}`));
            } else {
                this.values = data;
            }
        },

        /**
         * 
         * @param {number} identifier 
         * @returns {Queue}
         */
        getQueue(identifier: number): Queue{
            return this.values.find(q => q.queueId == identifier);
        },

        /**
         * 
         * @param {string} map 
         * @returns {Queue[]}
         */
        getQueuesByMap(map: string): Queue[]{
            return this.values.filter(q => q.map == map);
        }
    },

    Maps: {
        /** @type {GameMap[]} */
        values: [],
        fileName: "maps.json",

        async load(data, options) {
            if (data == null) {
                this.values = JSON.parse(await httpsGet(`${Data.getStaticDataUrl(this.fileName)}`));
            } else {
                this.values = data;
            }
        }
    },

    GameModes: {
        /** @type {GameMode[]} */
        values: [],
        fileName: "gameModes.json",

        async load(data, options) {
            if (data == null) {
                this.values = JSON.parse(await httpsGet(`${Data.getStaticDataUrl(this.fileName)}`));
            } else {
                this.values = data;
            }
        }
    },

    GameTypes: {
        /** @type {GameType[]} */
        values: [],
        fileName: "gameTypes.json",

        async load(data, options) {
            if (data == null) {
                this.values = JSON.parse(await httpsGet(`${Data.getStaticDataUrl(this.fileName)}`));
            } else {
                this.values = data;
            }
        }
    }
}

const DataKeyMap = { }

Object.entries(Data).forEach(([key, value]) => {
    if(typeof value?.load === "function")
        DataKeyMap[key.charAt(0).toLowerCase() + key.substring(1)] = value.load.bind(value);
})

export default Data;