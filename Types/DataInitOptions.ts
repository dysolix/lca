import { DataKey } from "../Data";
import LanguageCode from "./LanguageCode";
import ServerRegion from "./ServerRegion";

type DataInitOptions = {
    requireLatestData?: boolean;
    server?: ServerRegion;
    language?: LanguageCode;
    requiredData?: DataKey[];
    dataVersion?: string;
};

export default DataInitOptions;
