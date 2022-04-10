declare global {
    namespace LCA {
        type DataInitOptions = {
            requireLatestData?: boolean;
            server?: ServerRegion;
            language?: LanguageCode;
            requiredData?: DataKey[];
            dataVersion?: string;
        };
    }
}

export { }