import { NextResponse } from "next/server";
import { db } from "@/server/db";

export async function GET() {
  try {
    const count = await db.link.count();
    console.log("Cron success", count);
    return NextResponse.json({ ok: true, count });
  } catch (error) {
    console.error("Cron failed", error);
    return NextResponse.json(
      // @ts-expect-error || @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      { ok: false, error: error.message },
      { status: 500 },
    );
  }
}
