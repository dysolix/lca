declare global {
    namespace LCA {
        type RuneTree = {
            id: number
            key: string
            icon: string
            name: string
            slots: RuneSlot[]
        }

        type RuneSlot = {
            runes: Rune[]
        }
    }
}

export { }