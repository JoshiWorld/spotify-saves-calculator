import { type DigistoreIPN } from "@/lib/digistore";
import { NextResponse } from "next/server";

const allowedIPs = ["34.95.42.191"];


export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip");

    // Überprüfe, ob die IP von Digistore24 stammt
    // @ts-expect-error || @ts-ignore
    if (!allowedIPs.includes(ip)) {
      console.error("Unzulässige IP-Adresse:", ip);
      return NextResponse.json({ error: "Unzulässige IP" }, { status: 403 });
    }

    // Empfange den Webhook-Body als Text
    const body = await req.text();
    console.log("Raw body:", body);

    // Verarbeite den Webhook weiter (z. B. parse body)
    const parsedBody = Object.fromEntries(
      new URLSearchParams(body),
    ) as DigistoreIPN;
    console.log("Parsed body:", parsedBody);

    return NextResponse.json(
      { message: "IPN erfolgreich verarbeitet", data: parsedBody },
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
