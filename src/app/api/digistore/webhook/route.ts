import { type DigistoreIPN } from "@/lib/digistore";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    console.log("Raw body:", body);

    // Form-Daten parsen
    const parsedBody = Object.fromEntries(
      new URLSearchParams(body),
    ) as DigistoreIPN;
    console.log("Parsed body:", parsedBody);

    // Beispiel: Zugriff auf die Felder
    const email = parsedBody.email ?? "Nicht angegeben";
    const productName = parsedBody.product_name ?? "Nicht angegeben";

    return NextResponse.json(
      { message: "IPN erfolgreich verarbeitet", data: { email, productName } },
      { status: 200 },
    );
  } catch (error) {
    console.error("Fehler beim Verarbeiten des Digistore IPN:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 },
    );
  }
}
