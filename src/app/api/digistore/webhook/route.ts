import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    // const body = await req.json();

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
