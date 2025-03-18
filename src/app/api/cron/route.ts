import { NextResponse } from "next/server";
import { db } from "@/server/db";

export async function GET() {
  await db.link.findFirst({
    select: {
      id: true,
    },
  });
  console.log('Cron success');
  return NextResponse.json({ ok: true });
}
