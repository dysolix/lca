export default class ChampSelectSession {
    data: any;
    ownBanActionId: number;
    ownPickActionId: number;
    inProgressActionIds: number[];

    constructor(data: any) {
        this.data = data;
        this.ownBanActionId = -1;
        this.ownPickActionId = -1;
        this.inProgressActionIds = [];

        for (let actionGroup of this.data.actions)
            for (let action of actionGroup) {
                if (action.isInProgress)
                    this.inProgressActionIds.push(action.id);
                if (action.actorCellId === data.localPlayerCellId) {
                    if (action.type === "ban") {
                        this.ownBanActionId = action.id;
                    } else if (action.type === "pick") {
                        this.ownPickActionId = action.id;
                    }
                }
            }
    }

    getPickedChampionIds(): number[] {
        let picked: number[] = [];

        for (let actionGroup of this.data.actions)
            for (let action of actionGroup)
                if (action.type === "pick" && !picked.includes(action.championId)) {
                    picked.push(Number(action.championId));
                }

        return picked;
    }

    getBannedChampionIds(): number[] {
        let banned: number[] = [];

        for (let actionGroup of this.data.actions)
            for (let action of actionGroup)
                if (action.type === "ban" && !banned.includes(action.championId)) {
                    banned.push(Number(action.championId));
                }

        return banned;
    }

    getPhase() {
        switch (this.data.timer.phase) {
            case "PLANNING":
                return "INTENT";
            case "BAN_PICK": {
                let tenBansRevealActionId = this.getTenBansRevealActionId();
                if (tenBansRevealActionId == null)
                    return "PICK";
                if (this.getActionById(tenBansRevealActionId).completed)
                    return "PICK";
                return "BAN";
            }
            case "FINALIZATION":
                return "FINALIZE";
            default:
                break;
        }

        return "NONE";
    }

    getActionById(id: number) {
        for (let actionGroup of this.data.actions)
            for (let action of actionGroup)
                if (action.id == id)
                    return action;

        return null;
    }

    getTenBansRevealActionId(): number | null {
        for (let actionGroup of this.data.actions)
            for (let action of actionGroup)
                if (action.type === "ten_bans_reveal")
                    return action.id;

        return null;
    }

    getTeamMemberByPosition(position: 'top' | 'jungle' | 'middle' | 'bottom' | 'utility' | string) {
        position = position.trim().toLowerCase();
        if (position === "support")
            position = "utility";
        if (position === "mid")
            position = "middle";
        if (position === "adc")
            position = "bottom";

        for (let teamMember of this.data.myTeam) {
            if (teamMember.assignedPosition === position)
                return teamMember;
        }

        return null;
    }
}

type ChampSelectSessionType = ChampSelectSession;

declare global {
    namespace LCA {
        export type ChampSelectSession = ChampSelectSessionType;
    }
}