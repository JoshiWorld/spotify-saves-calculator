import { env } from "@/env";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = await req.json();

    const copecartSecret = req.headers.get("x-copecart-secret");
    if(copecartSecret !== env.COPECART_KEY) {
        return NextResponse.json(
          { error: "Nicht autorisiert" },
          { status: 401 },
        );
    }

    // Sicherstellen, dass die Authentizität des Webhooks überprüft wird, z. B. mit einem Secret
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { event, payload } = data;

    if (event === "order.completed") {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const userEmail = payload.customer.email;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const productName = payload.product.name;

      console.log('MAIL:', userEmail);
      console.log('PRODUCT:', productName);
      console.log('PAYLOAD:', payload);

      if (productName === "Starter Paket") {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await updateUserSubscription(userEmail, "Starter");
      } else if (productName === "Artist Paket") {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await updateUserSubscription(userEmail, "Artist");
      } else if (productName === "Label Paket") {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await updateUserSubscription(userEmail, "Label");
      }
    }

    return NextResponse.json(
      { message: "Webhook empfangen." },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error handling CopeCart webhook:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 },
    );
  }
}

async function updateUserSubscription(email: string, subscriptionType: string) {
  console.log(`Aktualisiere Abonnement für ${email} auf ${subscriptionType}`);
}
