export default class RunePage {
    /**
     * 
     * @param {{name: string, selectedPerkIds: number[]}} data 
     */
    constructor(data = {}) {
        /** @type {[]} */
        this.autoModifiedSelections = data.autoModifiedSelections ?? [];
        /** @type {boolean} */
        this.current = data.current ?? true;
        /** @type {number} */
        this.id = data.id ?? 0;
        /** @type {boolean} */
        this.isActive = data.isActive ?? false;
        /** @type {boolean} */
        this.isDeletable = data.isDeletable ?? true;
        /** @type {boolean} */
        this.isEditable = data.isEditable ?? true;
        /** @type {boolean} */
        this.isValid = data.isValid ?? true;
        /** @type {number} */
        this.lastModified = data.lastModified ?? 0;
        /** @type {string} */
        this.name = data.name ?? 'Unnamed Rune Page';
        /** @type {number} */
        this.order = data.order ?? 0;
        /** @type {number[]} */
        this.selectedPerkIds = data.selectedPerkIds ?? [];

        // /** @type {number} */
        // this.primaryStyleId = data.primaryStyleId ?? 0;
        // /** @type {number} */
        // this.subStyleId = data.subStyleId ?? 0;
    }

    get primaryStyleId() {
        return Data.Runes.getRuneById(this.selectedPerkIds[0])?.runeTreeId ?? 0;
    }

    get subStyleId() {
        return Data.Runes.getRuneById(this.selectedPerkIds[4])?.runeTreeId ?? 0;
    }

    update(){
        let client = window.leagueClient;
        if(!client) return;

        client.deleteRunePage(this.id);
        client.createRunePage(this);
    }

    toJSON(){
        let jsonObj = { ...this };
        jsonObj.primaryStyleId = this.primaryStyleId;
        jsonObj.subStyleId = this.subStyleId;
        return jsonObj;
    }
}