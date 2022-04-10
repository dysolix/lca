declare global {
    namespace LCA {
        type GameMap = {
            mapId: number;
            mapName: string;
            notes: string;
        };

        function x(): any;
    }
}

export { }