import { db } from "@/server/db";
import { ActivityActions, type ActivityEntityType, ActivityEntityTypes, type ActivityAction } from "@/lib/activity";

export async function logActivity(params: {
    userId: string;
    action: ActivityAction;
    entityId?: string;
    entityType: ActivityEntityType;
    message: string;
}) {
    return db.activity.create({
        data: {
            userId: params.userId,
            action: ActivityActions[params.action],
            entityId: params.entityId,
            entityType: ActivityEntityTypes[params.entityType],
            message: params.message,
        },
    });
}