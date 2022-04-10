import Data from "../Data";

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

    private _primaryStyleId: number | undefined;
    private _subStyleId: number | undefined;

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

    get primaryStyleId() {
        if(!Data.Runes.isLoaded)
            return this._primaryStyleId;
        
        return Data.Runes.getRuneTreeByRune(this.selectedPerkIds[0])?.id;
    }

    get subStyleId() {
        if(!Data.Runes.isLoaded)
            return this._subStyleId;
        
        return Data.Runes.getRuneTreeByRune(this.selectedPerkIds[4])?.id;
    }

    set primaryStyleId(value){
        this._primaryStyleId = value;
    }

    set subStyleId(value){
        this._primaryStyleId = value;
    }

    update(){
        let client = window.leagueClient;
        if(!client) return;

        client.deleteRunePage(this.id);
        client.createRunePage(this);
    }

    toJSON(){
        let jsonObj = { ...this };

        delete jsonObj._primaryStyleId;
        delete jsonObj._subStyleId;

        jsonObj.primaryStyleId = this.primaryStyleId;
        jsonObj.subStyleId = this.subStyleId;
        return jsonObj;
    }
}

type RunePageType = RunePage;

declare global {
    namespace LCA {
        type RunePage = RunePageType;
    }
}