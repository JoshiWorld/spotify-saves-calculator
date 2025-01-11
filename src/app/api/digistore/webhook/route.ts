import { NextResponse } from "next/server";
import { api } from "@/trpc/server";
import { type Copecart, verifyCopeCartSignature } from "@/lib/copecart";
import { LogType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    // const signature = req.headers.get("x-copecart-signature");

    // if (!verifyCopeCartSignature(body, signature)) {
    //   return NextResponse.json(
    //     { error: "Ungültige Signatur" },
    //     { status: 401 },
    //   );
    // }

    await api.log.create({ logtype: LogType.INFO, message: body });

    return NextResponse.json(
      { message: "IPN erfolgreich verarbeitet" },
      { status: 200 },
    );


    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data: Copecart = JSON.parse(body);

    // Prüfen, welches Event gesendet wurde
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { event_type, ...payload } = data;

    const userEmail = payload.buyer_email;
    const productName = payload.product_internal_name;

    // switch (event_type) {
    //   case "payment.made":
    //   case "payment.trial":
    //     await updateUserSubscription(userEmail, productName, body, signature);
    //     break;
    //   case "payment.failed":
    //   case "payment.refunded":
    //   case "payment.charged_back":
    //     await cancelUserSubscription(userEmail, body, signature);
    //     break;
    // }

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
