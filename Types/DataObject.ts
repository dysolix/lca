import Champion from "./Champion";
import GameMap from "./GameMap";
import GameMode from "./GameMode";
import GameType from "./GameType";
import Queue from "./GameQueue";

type DataObject = {
    [key: string]: any,
    version?: string;
    champions?: Champion[];
    summonerSpells?: [];
    queues?: Queue[];
    gameModes?: GameMode[];
    maps?: GameMap[];
    gameTypes?: GameType[];
};

export default DataObject;