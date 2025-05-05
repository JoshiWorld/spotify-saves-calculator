import { type DigistoreIPN } from "@/lib/digistore";
import { sendConfirmationEmail } from "@/lib/mail";
import { db } from "@/server/db";
import { api } from "@/trpc/server";
import { LogType } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // const ip =
    //   req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip");

    // const whitelist = await api.whitelist.getWhitelist();

    // // Überprüfe, ob die IP von Digistore24 stammt
    // // @ts-expect-error || @ts-ignore
    // if (!whitelist.includes(ip)) {
    //   console.error("Unzulässige IP-Adresse:", ip);
    //   return NextResponse.json({ error: "Unzulässige IP: " + ip }, { status: 403 });
    // }
    if (!req.headers.get("user-agent")?.includes("DigiStore-API")) {
      console.error("Unzulässiger Absender:", req.headers.get("user-agent"));
      return NextResponse.json(
        { error: "Unzulässiger Abesender: " + req.headers.get("user-agent") },
        { status: 403 },
      );
    }

    const body = await req.text();

    const parsedBody = Object.fromEntries(
      new URLSearchParams(body),
    ) as DigistoreIPN;

    await db.log.create({
      data: {
        message: JSON.stringify(parsedBody),
        type: LogType.INFO,
      },
    });

    switch (parsedBody.event) {
      case "rebill_cancelled":
      case "missed recurring payment":
      case "chargeback":
      case "refund":
      case "rebilling canceled":
      case "rejected payment":
      case "on_rebill_resumed":
      case "on_rebill_cancelled":
      case "payment_denial":
      case "on_payment_missed":
      case "on_chargeback":
      case "on_refund":
        await cancelUserSubscription(
          parsedBody.email!.toLowerCase(),
          parsedBody.first_name!,
        );
        break;
      case "payment":
      case "on_payment":
        await updateUserSubscription(
          parsedBody.email!.toLowerCase(),
          parsedBody.product_id!,
          parsedBody.first_name!,
        );
        break;
      default:
        console.error("Unbekanntes Event:", parsedBody.event);
        break;
    }

    await sendConfirmationEmail(parsedBody.email!, parsedBody.first_name!);

    return NextResponse.json(
      { message: "IPN erfolgreich verarbeitet", data: parsedBody },
      { status: 200 },
    );
  } catch (error) {
    console.error("Fehler beim Verarbeiten des Digistore IPN:", error);
    // @ts-expect-error || @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    await api.log.create({ message: error.toString(), logtype: LogType.ERROR });
    return NextResponse.json(
      { error: "Digistore IPN konnte nicht verarbeitet werden" },
      { status: 500 },
    );
  }
}

async function updateUserSubscription(
  email: string,
  productName: string,
  name: string,
) {
  await api.user.updateSubscriptionDigistore({
    email,
    name,
    productName,
  });
}

async function cancelUserSubscription(email: string, name: string) {
  await api.user.updateSubscriptionDigistore({ email, name });
}

/*

rebill_cancelled – Dies könnte der Fall sein, wenn ein Abonnement storniert wird, aber die bezahlte Zeit noch bis zum Ende des Abrechnungszyklus weiterläuft.

rebill_completed – Wenn eine Abonnementzahlung erfolgreich abgeschlossen wurde.

payment_completed – Wenn eine einmalige Zahlung erfolgreich abgeschlossen wurde (nicht abonnierend).

payment_failed – Wenn eine Zahlung nicht erfolgreich war.

payment_refunded – Wenn eine Zahlung zurückerstattet wurde.

trial_ended – Wenn ein kostenloses Probeabonnement endet.

subscription_ended – Wenn ein Abonnement abläuft und das Konto gesperrt oder eingestellt wird (eventuell nach Ablauf der bezahlten Zeit).

payment_pending – Wenn eine Zahlung im Status "pending" ist.

subscription_resumed – Wenn ein Abonnement, das pausiert wurde, wieder aktiviert wird.

*/
