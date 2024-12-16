import { TRPCError } from "@trpc/server";

export function INTERNAL_SERVER_ERROR(message: string) {
  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: message,
  });
}
