import DataInitOptions from "./Types/DataInitOptions";
import DataObject from "./Types/DataObject";
import LCA from "./LCA";
import GameQueue from "./Types/GameQueue";
import Champion from "./Types/Champion";
import LanguageCode from "./Types/LanguageCode";
import GameType from "./Types/GameType";
import GameMode from "./Types/GameMode";
import GameMap from "./Types/GameMap";
import SummonerSpell from "./Types/SummonerSpell";

const httpsGet = LCA.Util.httpsGet;

export type DataKey = "champions" | "summonerSpells" | "queues" | "gameModes" | "maps" | "gameTypes";

abstract class DataHandler<T>{
    values: T[]

    load = async (data: T[] | null, options?: DataInitOptions) => {
        if (data !== null) {
            this.values = data;
        } else {
            this.values = await this.downloadData()
        }
    }

    abstract downloadData(options?: DataInitOptions): Promise<T[]>;
}

const Data = {
    async init({ data = {}, options = {} }: { data?: DataObject, options: DataInitOptions } = { data: {}, options: {} }) {
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


        Object.entries(Data).forEach(([key, val]) => {
            if(val instanceof DataHandler){
                let dataValues = (options.requireLatestData && Data.latestPatch !== data.version) ? null : data[key.charAt(0).toLowerCase() + key.substring(1)];
                if (dataValues === null) Data.wasUpdated = true;

                promises.push(val.load(dataValues, options));
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
            if (value?.values?.length > 0) {
                dataObject[key.charAt(0).toLowerCase() + key.substring(1)] = value.values;
            }
        });

        return dataObject;
    },

    /** Latest patch  */
    latestPatch: null,
    dataPatch: null,
    wasUpdated: false,

    getDataDragonUrl(language: LanguageCode = "en_US", patch: string = undefined, file = ""): string {
        return `https://ddragon.leagueoflegends.com/cdn/${(patch ?? this.latestPatch)}/data/${language}/${file}`;
    },

    getStaticDataUrl(file = "") {
        return `https://static.developer.riotgames.com/docs/lol/${file}`;
    },

    /**
     * @param server Server region, defaults to "euw"
     * @returns The latest patch for given server region
     */
    async getLatestPatch(server: string = "euw"): Promise<string> {
        let responseString = await httpsGet(`https://ddragon.leagueoflegends.com/realms/${server}.json`);
        if (responseString == null) return null;
        let realmData = JSON.parse(responseString);
        return realmData.dd;
    },

    Champions: new class extends DataHandler<Champion>{
        downloadData = async (options: DataInitOptions): Promise<Champion[]> => JSON.parse(await httpsGet(`${Data.getDataDragonUrl(options.language, Data.dataPatch, "champion.json")}`)).data;

        /**
         * @param identifier The champions display name, internal name or key
         * @returns The champion corresponding to the passed identifier
         */
         getChampion(identifier: string | number): Champion | null {
            if (!isNaN(Number(identifier))) {
                return this.values.find(champion => champion.key == identifier) ?? null;
            } else {
                return this.values.find(champion => champion.id === identifier || champion.name === identifier) ?? null;
            }
        }
    },

    SummonerSpells: new class extends DataHandler<SummonerSpell>{
        downloadData = async (options: DataInitOptions): Promise<SummonerSpell[]> => JSON.parse(await httpsGet(`${Data.getDataDragonUrl(options.language, Data.dataPatch, "summoner.json")}`)).data;
    },

    Queues: new class extends DataHandler<GameQueue>{
        downloadData = async (): Promise<GameQueue[]> => JSON.parse(await httpsGet(`${Data.getStaticDataUrl("queues.json")}`));

        getQueue(identifier: number): GameQueue {
            return this.values.find(q => q.queueId == identifier);
        }

        getQueuesByMap(map: string): GameQueue[] {
            return this.values.filter(q => q.map == map);
        }
    },

    Maps: new class extends DataHandler<GameMap>{
        downloadData = async (): Promise<GameMap[]> => JSON.parse(await httpsGet(`${Data.getStaticDataUrl("maps.json")}`));
    },

    GameModes: new class extends DataHandler<GameMode>{
        downloadData = async (): Promise<GameMode[]> => JSON.parse(await httpsGet(`${Data.getStaticDataUrl("gameModes.json")}`));
    },

    GameTypes: new class extends DataHandler<GameType>{
        downloadData = async (): Promise<GameType[]> => JSON.parse(await httpsGet(`${Data.getStaticDataUrl("gameTypes.json")}`));
    }
}

export default Data;