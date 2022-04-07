import ChampionInfo from "./ChampionInfo"
import ChampionPartype from "./ChampionPartype"
import ChampionStats from "./ChampionStats"
import ChampionTag from "./ChampionTag"
import ImageData from "./ImageData"

export type Champion = {
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

  export default Champion;