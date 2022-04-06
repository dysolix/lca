import Champion from "./Champion";
import GameMap from "./GameMap";
import GameMode from "./GameMode";
import GameType from "./GameType";
import Queue from "./Queue";

type DataObject = {
    version?: string;
    champions?: Champion[];
    summonerSpells?: [];
    queues?: Queue[];
    gameModes?: GameMode[];
    maps?: GameMap[];
    gameTypes?: GameType[];
};

export default DataObject;