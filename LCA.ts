import * as _https from 'https';
import _Data from "./Data";

import _Champion from "./Types/Champion";
import _ChampionInfo from "./Types/ChampionInfo";
import _ChampionPartype from "./Types/ChampionPartype";
import _ChampionStats from "./Types/ChampionStats";
import _ChampionTag from "./Types/ChampionTag";

import _ChampSelectPhase from "./Types/ChampSelectPhase";
import _ChampSelectSession from "./Types/ChampSelectSession"
import _DataInitOptions from "./Types/DataInitOptions";
import _DataObject from "./Types/DataObject";
import _GameFlowPhase from "./Types/GameFlowPhase";
import _GameMap from "./Types/GameMap";
import _GameMode from "./Types/GameMode";
import _GameQueue from "./Types/GameQueue";
import _GameType from "./Types/GameType";
import _ImageData from "./Types/ImageData";
import _LanguageCode from "./Types/LanguageCode";
import _LCAEvent from "./Types/LCAEvent";
import _LCUEvent from "./Types/LCUEvent";
import _RunePage from "./Types/RunePage";
import _ServerRegion from "./Types/ServerRegion";
import _SummonerSpell from "./Types/SummonerSpell";

import _Client from "./Client";

namespace LCA {
    export const Client = _Client;
    export type Client = _Client;

    export const Data = _Data;

    export namespace Util {
        /**
         * Simple https get request
         * @param url 
         * @returns The response string or null
         */
        export function httpsGet(url: string) : Promise<string | null> {
            return new Promise((resolve, reject) => {
                _https.get(url, res => {
                    var resBody: string[] = [];
        
                    res.setEncoding('utf8');
                    res.on('data', data => resBody.push(data));
                    res.on('end', () => resolve(resBody.join("")));
                    res.on('error', (err) => reject());
                });
            }).then(value => value, err => null);
        }

        /**
         * Compares two patch versions
         * @returns true, if the first patch is newer 
         */
        export function isPatchNewer(firstPatch: string, secondPatch: string) : boolean {
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

    export namespace Types {
        export type Champion = _Champion;
        export type ChampionInfo = _ChampionInfo;
        export type ChampionPartype = _ChampionPartype;
        export type ChampionStats = _ChampionStats;
        export type ChampionTag = _ChampionTag;
        export type ChampSelectPhase = _ChampSelectPhase;
        export type DataInitOptions = _DataInitOptions;
        export type DataObject = _DataObject;
        export type GameFlowPhase = _GameFlowPhase;
        export type GameMap = _GameMap;
        export type GameMode = _GameMode;
        export type GameQueue = _GameQueue;
        export type GameType = _GameType;
        export type ImageData = _ImageData;
        export type LanguageCode = _LanguageCode;
        export type LCAEvent = _LCAEvent;
        export type ServerRegion = _ServerRegion;
        export type SummonerSpell = _SummonerSpell;
    }

    export namespace Classes{
        export const ChampSelectSession = _ChampSelectSession;
        export type ChampSelectSession = _ChampSelectSession;

        export const RunePage = _RunePage;
        export type RunePage = _RunePage;
    }

    export namespace Enums{
        export const LCUEvent = _LCUEvent;
        export type LCUEvent = _LCUEvent;
    }
}

export default LCA;