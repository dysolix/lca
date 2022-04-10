declare global {
    namespace LCA {
        type DataObject = {
            [key: string]: any,
            version?: string;
            champions?: Champion[];
            summonerSpells?: [];
            queues?: GameQueue[];
            gameModes?: GameMode[];
            maps?: GameMap[];
            gameTypes?: GameType[];
        };
    }
}

export { }