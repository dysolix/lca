import Data from "../Data";
export default class RunePage {
    constructor(data = {}) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        this.autoModifiedSelections = (_a = data.autoModifiedSelections) !== null && _a !== void 0 ? _a : [];
        this.current = (_b = data.current) !== null && _b !== void 0 ? _b : true;
        this.id = (_c = data.id) !== null && _c !== void 0 ? _c : 0;
        this.isActive = (_d = data.isActive) !== null && _d !== void 0 ? _d : false;
        this.isDeletable = (_e = data.isDeletable) !== null && _e !== void 0 ? _e : true;
        this.isEditable = (_f = data.isEditable) !== null && _f !== void 0 ? _f : true;
        this.isValid = (_g = data.isValid) !== null && _g !== void 0 ? _g : true;
        this.lastModified = (_h = data.lastModified) !== null && _h !== void 0 ? _h : 0;
        this.name = (_j = data.name) !== null && _j !== void 0 ? _j : 'Unnamed Rune Page';
        this.order = (_k = data.order) !== null && _k !== void 0 ? _k : 0;
        this.selectedPerkIds = (_l = data.selectedPerkIds) !== null && _l !== void 0 ? _l : [];
        this.primaryStyleId = (_m = data.primaryStyleId) !== null && _m !== void 0 ? _m : 0;
        this.subStyleId = (_o = data.subStyleId) !== null && _o !== void 0 ? _o : 0;
    }
    get primaryStyleId() {
        var _a;
        if (!Data.Runes.isLoaded)
            return this._primaryStyleId;
        return (_a = Data.Runes.getRuneTreeByRune(this.selectedPerkIds[0])) === null || _a === void 0 ? void 0 : _a.id;
    }
    get subStyleId() {
        var _a;
        if (!Data.Runes.isLoaded)
            return this._subStyleId;
        return (_a = Data.Runes.getRuneTreeByRune(this.selectedPerkIds[4])) === null || _a === void 0 ? void 0 : _a.id;
    }
    set primaryStyleId(value) {
        this._primaryStyleId = value;
    }
    set subStyleId(value) {
        this._primaryStyleId = value;
    }
    update() {
        let client = window.leagueClient;
        if (!client)
            return;
        client.deleteRunePage(this.id);
        client.createRunePage(this);
    }
    toJSON() {
        let jsonObj = Object.assign({}, this);
        delete jsonObj._primaryStyleId;
        delete jsonObj._subStyleId;
        jsonObj.primaryStyleId = this.primaryStyleId;
        jsonObj.subStyleId = this.subStyleId;
        return jsonObj;
    }
}
