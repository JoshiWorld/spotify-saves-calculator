import { type DigistoreIPN } from "@/lib/digistore";
import { api } from "@/trpc/server";
import { LogType } from "@prisma/client";
import { NextResponse } from "next/server";

const allowedIPs = ["34.95.42.191, 34.152.51.13"];

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

    const body = await req.text();
    console.log("Raw body:", body);

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
    await api.log.create({ message: error as string, logtype: LogType.ERROR });
    return NextResponse.json(
      { error: "Digistore IPN konnte nicht verarbeitet werden" },
      { status: 500 },
    );
  }
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