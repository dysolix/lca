import ImageData from "./ImageData"

type Champion = {
    version: string
    id: string
    key: string
    name: string
    title: string
    blurb: string
    info: ChampionInfo
    image: ImageData
    tags: ChampionTag[]
    partype: ChampionPartype
    stats: ChampionStats
  }

  export type ChampionTag = "Fighter" | "Tank" | "Mage" | "Assassin" | "Support" | "Marksman";

  export type ChampionPartype = "None" | "Mana" | "Energy" | "Blood Well" | "Fury" | "Ferocity" | "Heat" | "Grit" | "Crimson Rush" | "Flow" | "Shield";
  
  export type ChampionInfo = {
    attack: number
    defense: number
    magic: number
    difficulty: number
  }
  
  export type ChampionStats = {
    hp: number
    hpperlevel: number
    mp: number
    mpperlevel: number
    movespeed: number
    armor: number
    armorperlevel: number
    spellblock: number
    spellblockperlevel: number
    attackrange: number
    hpregen: number
    hpregenperlevel: number
    mpregen: number
    mpregenperlevel: number
    crit: number
    critperlevel: number
    attackdamage: number
    attackdamageperlevel: number
    attackspeedperlevel: number
    attackspeed: number
  }
  
  export default Champion;