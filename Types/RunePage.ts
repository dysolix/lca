import LCA from "../LCA";

export default class RunePage {
    autoModifiedSelections: any[];
    current: boolean;
    id: number;
    isActive: boolean;
    isDeletable: boolean;
    isEditable: boolean;
    isValid: boolean;
    lastModified: number;
    name: string;
    order: number;
    selectedPerkIds: number[];
    primaryStyleId: number;
    subStyleId: number;

    constructor(data: any = {}) {
        this.autoModifiedSelections = data.autoModifiedSelections ?? [];
        this.current = data.current ?? true;
        this.id = data.id ?? 0;
        this.isActive = data.isActive ?? false;
        this.isDeletable = data.isDeletable ?? true;
        this.isEditable = data.isEditable ?? true;
        this.isValid = data.isValid ?? true;
        this.lastModified = data.lastModified ?? 0;
        this.name = data.name ?? 'Unnamed Rune Page';
        this.order = data.order ?? 0;
        this.selectedPerkIds = data.selectedPerkIds ?? [];
        this.primaryStyleId = data.primaryStyleId ?? 0;
        this.subStyleId = data.subStyleId ?? 0;
    }

    update(){
        let client: LCA.Client = window['leagueClient'];
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