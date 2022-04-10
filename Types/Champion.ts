declare global {
  namespace LCA {
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
  }
}

export { }