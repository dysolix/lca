import { httpsGet } from "./Util";

abstract class DataHandler<T>{
    values: T[] = []

    load = async (data: T[] | null, options?: LCA.DataInitOptions) => {
        if (data !== null) {
            this.values = data;
        } else {
            this.values = await this.downloadData()
        }
    }

    abstract downloadData(options?: LCA.DataInitOptions): Promise<T[]>;
}

const Data: { dataPatch: string | null, latestPatch: string | null, [key: string]: any } = {
    async init({ data = {}, options = {} }: { data?: LCA.DataObject, options: LCA.DataInitOptions } = { data: {}, options: {} }) {
        options.server = options.server ?? "euw";
        options.language = options.language ?? "en_US";
        options.requireLatestData = options.requireLatestData ?? true;

        this.latestPatch = await this.getLatestPatch(options.server);
        if (this.latestPatch === null) {
            if (options.requireLatestData)
                throw new Error("Unable to retrieve latest patch.");
        }

        this.dataPatch = data.version ?? null;

        let promises: Promise<any>[] = [];

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
    },

    /**
     * 
     * @returns {LCA.DataObject} Data object that can be stored and passed into the init method
     */
    getDataObject(): LCA.DataObject {
        let dataObject: LCA.DataObject = { };
        if(this.dataPatch !== null) dataObject.version = this.dataPatch;

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

    getDataDragonUrl(language: LCA.LanguageCode = "en_US", patch: string | undefined = undefined, file = ""): string {
        return `https://ddragon.leagueoflegends.com/cdn/${(patch ?? this.latestPatch)}/data/${language}/${file}`;
    },

    getStaticDataUrl(file = "") {
        return `https://static.developer.riotgames.com/docs/lol/${file}`;
    },

    /**
     * @param server Server region, defaults to "euw"
     * @returns The latest patch for given server region
     */
    async getLatestPatch(server: string = "euw"): Promise<string | null> {
        let responseString = await httpsGet(`https://ddragon.leagueoflegends.com/realms/${server}.json`);
        if (responseString == null) return null;
        let realmData = JSON.parse(responseString);
        return realmData.dd;
    },

    Champions: new class Champions extends DataHandler<LCA.Champion>{
        downloadData = async (options: LCA.DataInitOptions): Promise<LCA.Champion[]> => JSON.parse(await httpsGet(`${Data.getDataDragonUrl(options.language, Data.dataPatch, "champion.json")}`) ?? "").data;

        /**
         * @param identifier The champions display name, internal name or key
         * @returns The champion corresponding to the passed identifier
         */
         getChampion(identifier: string | number): LCA.Champion | null {
            if (!isNaN(identifier as any)) {
                return this.values.find(champion => champion.key == identifier) ?? null;
            } else {
                return this.values.find(champion => champion.id === identifier || champion.name === identifier) ?? null;
            }
        }
    },

    SummonerSpells: new class SummonerSpells extends DataHandler<LCA.SummonerSpell>{
        downloadData = async (options: LCA.DataInitOptions): Promise<LCA.SummonerSpell[]> => JSON.parse(await httpsGet(`${Data.getDataDragonUrl(options.language, Data.dataPatch, "summoner.json")}`) ?? "").data;
    },

    Queues: new class Queues extends DataHandler<LCA.GameQueue>{
        downloadData = async (): Promise<LCA.GameQueue[]> => JSON.parse(await httpsGet(`${Data.getStaticDataUrl("queues.json")}`) ?? "");

        getQueue(identifier: number): LCA.GameQueue | undefined {
            return this.values.find(q => q.queueId == identifier);
        }

        getQueuesByMap(map: string): LCA.GameQueue[] {
            return this.values.filter(q => q.map == map);
        }
    },

    Maps: new class Maps extends DataHandler<LCA.GameMap>{
        downloadData = async (): Promise<LCA.GameMap[]> => JSON.parse(await httpsGet(`${Data.getStaticDataUrl("maps.json")}`) ?? "");
    },

    GameModes: new class GameModes extends DataHandler<LCA.GameMode>{
        downloadData = async (): Promise<LCA.GameMode[]> => JSON.parse(await httpsGet(`${Data.getStaticDataUrl("gameModes.json")}`) ?? "");
    },

    GameTypes: new class GameTypes extends DataHandler<LCA.GameType>{
        downloadData = async (): Promise<LCA.GameType[]> => JSON.parse(await httpsGet(`${Data.getStaticDataUrl("gameTypes.json")}`) ?? "");
    }
}

export default Data;

declare global {
    namespace LCA {
        type DataKey = "champions" | "summonerSpells" | "queues" | "gameModes" | "maps" | "gameTypes";
    }
}