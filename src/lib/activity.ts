export const ActivityActions = {
    CREATE: "CREATE",
    UPDATE: "UPDATE",
    DELETE: "DELETE",
    UNKNOWN: "UNKNOWN",
} as const;

export type ActivityAction = keyof typeof ActivityActions;

export const ActivityEntityTypes = {
    SMARTLINK: "SMARTLINK",
    PLAYLISTANALYZER: "PLAYLISTANALYZER",
    SAVESCALCULATOR: "SAVESCALCULATOR",
    UNKNOWN: "UNKNOWN",
} as const;

export type ActivityEntityType = keyof typeof ActivityEntityTypes;