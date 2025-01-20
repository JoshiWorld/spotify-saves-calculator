import { NextResponse } from "next/server";
import { api } from "@/trpc/server";
import { LogType } from "@prisma/client";
import crypto from "crypto";

const DIGISTORE_SECRET = process.env.DIGISTORE_SECRET ?? ""; // Geheimschlüssel von Digistore24

export async function POST(req: Request) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = await req.json();

    // Debug: Log eingehende Daten (nur in Entwicklung aktivieren)
    await api.log.create({
      logtype: LogType.INFO,
      message: `Received webhook: ${JSON.stringify(body)}`,
    });

    // 1. Signatur extrahieren und validieren
    const signature = req.headers.get("x-digistore-signature") ?? "";
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const calculatedSignature = calculateSignature(body, DIGISTORE_SECRET);

    if (signature !== calculatedSignature) {
      console.error("Ungültige Signatur!");
      return NextResponse.json(
        { error: "Ungültige Signatur" },
        { status: 403 },
      );
    }

    // 2. Aktion basierend auf Event-Typ durchführen
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { event, email, productName } = body;

    if (event === "subscription_created") {
      await updateUserSubscription(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        email,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        productName,
        JSON.stringify(body),
        signature,
      );
    } else if (event === "subscription_cancelled") {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await cancelUserSubscription(email, JSON.stringify(body), signature);
    }

    // 3. Erfolgreiche Antwort senden
    return NextResponse.json(
      { message: "IPN erfolgreich verarbeitet" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Fehler beim Verarbeiten des Webhooks:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 },
    );
  }
}

// Hilfsfunktion zur Signaturberechnung
function calculateSignature(body: Record<string, unknown>, secret: string): string {
  const bodyString = Object.keys(body)
    .sort()
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    .map((key) => `${key}=${body[key]}`)
    .join("&");
  return crypto.createHmac("sha256", secret).update(bodyString).digest("hex");
}

async function updateUserSubscription(
  email: string,
  productName: string,
  body: string,
  signature: string | null,
) {
  await api.user.updateSubscription({ email, productName, body, signature });
}

async function cancelUserSubscription(
  email: string,
  body: string,
  signature: string | null,
) {
  await api.user.updateSubscription({ email, body, signature });
}
