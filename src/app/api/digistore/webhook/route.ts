import { NextResponse } from "next/server";
import { api } from "@/trpc/server";
import { LogType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = await req.json();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await api.log.create({ logtype: LogType.INFO, message: JSON.stringify(body) });

    return NextResponse.json(
      { message: "IPN erfolgreich verarbeitet" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Fehler beim Verarbeiten des CopeCart IPN:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 },
    );
  }
}

async function updateUserSubscription(email: string, productName: string, body: string, signature: string | null) {
  await api.user.updateSubscription({ email, productName, body, signature });
}

async function cancelUserSubscription(email: string, body: string, signature: string | null) {
  await api.user.updateSubscription({ email, body, signature });
}
