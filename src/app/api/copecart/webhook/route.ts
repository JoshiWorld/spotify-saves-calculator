import { env } from "@/env";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { api } from "@/trpc/server";

const COPECART_SECRET = env.COPECART_KEY;

export async function POST(req: Request) {
  try {
    const body = await req.text(); // Rohdaten des Requests, um die Signatur zu prüfen
    const signature = req.headers.get("x-copecart-signature");

    if (!verifyCopeCartSignature(body, signature)) {
      return NextResponse.json(
        { error: "Ungültige Signatur" },
        { status: 401 },
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = JSON.parse(body);

    // Prüfen, welches Event gesendet wurde
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { event, payload } = data;
    // console.log("CopeCart IPN Event:", event);

    if (event === "order.completed") {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const userEmail = payload.customer.email;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const productName = payload.product.name;

      // Logik zur Aktualisierung der Benutzerrechte basierend auf dem Produkt
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await updateUserSubscription(userEmail, productName);
    }

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

// Funktion zur Überprüfung der IPN-Signatur
function verifyCopeCartSignature(body: string, signature: string | null) {
  if (!signature || !COPECART_SECRET) return false;
  const hmac = crypto.createHmac("sha256", COPECART_SECRET);
  hmac.update(body, "utf8");
  const hash = hmac.digest("hex");
  return hash === signature;
}

// Beispiel-Funktion zur Verarbeitung der Abonnement-Updates
async function updateUserSubscription(email: string, productName: string) {
  await api.user.updateSubscription({ email });
  console.log(
    `Aktualisiere Abonnement für ${email} basierend auf ${productName}`,
  );
  // Implementiere deine Logik zur Aktualisierung der Benutzerrechte
}
