import { api } from "@/trpc/server";
import { type LogType } from "@prisma/client";

export async function log(message: string, type: LogType) {
    await api.log.create({ message, logtype: type.toString() });
}