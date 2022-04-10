declare global {
    export namespace LCA {
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
        }
    }
}

export { }