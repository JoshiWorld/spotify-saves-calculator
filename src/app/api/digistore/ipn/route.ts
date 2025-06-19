// app/api/digistore-ipn/route.ts
import { type NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/server/db";
import { env } from "@/env";
import { api } from "@/trpc/server";

const IPN_PASSPHRASE = env.DIGISTORE_KEY ?? "";

/**
 * Berechnet die Digistore24 SHA-Signatur.
 * Diese Funktion bildet die Logik der ursprünglichen PHP-Funktion `digistore_signature` nach.
 * @param shaPassphrase Die IPN-Passphrase von Digistore24.
 * @param parameters Alle empfangenen IPN-Parameter (req.formData()).
 * @param convertKeysToUppercase Ob die Schlüssel vor der Sortierung in Großbuchstaben umgewandelt werden sollen (Standard: false, da Digistore24 es nicht tut).
 * @param doHtmlDecode Ob Werte vor der Hash-Berechnung HTML-Entities dekodiert werden sollen (Standard: false, da Next.js Form-Data es nicht tut).
 * @returns Die berechnete SHA512-Signatur in Großbuchstaben.
 */
function digistoreSignature(
    shaPassphrase: string,
    parameters: Record<string, string>,
    convertKeysToUppercase = false,
    doHtmlDecode = false, // Beachte: req.formData() decodiert normalerweise keine HTML-Entities
): string {
    const algorithm = "sha512";
    const sortCaseSensitive = !convertKeysToUppercase;

    const paramsWithoutSignature = { ...parameters };
    delete paramsWithoutSignature.sha_sign;
    delete paramsWithoutSignature.SHASIGN; // Nur zur Sicherheit, falls es mal anders genannt wird

    const keys = Object.keys(paramsWithoutSignature);

    // Sortiere die Keys alphabetisch, wie PHP's array_multisort mit SORT_STRING
    // PHP's array_multisort ist komplexer, aber für reine String-Keys sollte
    // eine einfache alphabetische Sortierung ausreichen, um das gleiche Ergebnis zu erzielen.
    keys.sort((a, b) => {
        const keyA = sortCaseSensitive ? a : a.toUpperCase();
        const keyB = sortCaseSensitive ? b : b.toUpperCase();
        return keyA.localeCompare(keyB);
    });

    let shaString = "";
    for (const key of keys) {
        let value = paramsWithoutSignature[key];

        // Wenn HTML-Dekodierung erforderlich wäre (req.formData() sollte dies selten benötigen)
        if (doHtmlDecode) {
            // @ts-expect-error || cannot be undefined
            value = value
                .replace(/&amp;/g, "&")
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/&quot;/g, '"')
                .replace(/&#039;/g, "'");
        }

        const isEmpty = value === undefined || value === null || value === "";
        if (isEmpty) {
            continue;
        }

        const upperKey = convertKeysToUppercase ? key.toUpperCase() : key;
        shaString += `${upperKey}=${value}${shaPassphrase}`;
    }

    const shaSign = crypto
        .createHash(algorithm)
        .update(shaString)
        .digest("hex")
        .toUpperCase();

    return shaSign;
}

/**
 * Hilfsfunktion zum sicheren Abrufen von Werten aus den POST-Daten.
 * @param data Das Objekt mit den empfangenen IPN-Parametern.
 * @param key Der Schlüssel des gewünschten Parameters.
 * @returns Der Wert als String oder ein leerer String, wenn nicht vorhanden.
 */
function getPostedValue(data: Record<string, string>, key: string): string {
    return typeof data[key] === "string" ? data[key] : "";
}

/**
 * Der Haupt-Handler für POST-Anfragen an die IPN-Route.
 * Digistore24 sendet IPN-Daten als POST-Anfragen, typischerweise `application/x-www-form-urlencoded`.
 */
export async function POST(req: NextRequest) {
    if (req.method !== "POST") {
        return NextResponse.json({ message: "Method Not Allowed" }, { status: 405 });
    }

    // Next.js App Router parst `application/x-www-form-urlencoded` automatisch in `formData()`.
    const formData = await req.formData();
    const ipnData: Record<string, string> = {};

    // Konvertiere FormDataEntryValue zu string.
    // Werte können auch File sein, daher sicherstellen, dass es ein String ist.
    for (const [key, value] of formData.entries()) {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        ipnData[key] = value.toString();
    }

    // --- 1. Signatur-Validierung ---
    const mustValidateSignature = IPN_PASSPHRASE !== "";
    if (mustValidateSignature) {
        const receivedSignature = getPostedValue(ipnData, "sha_sign");
        const expectedSignature = digistoreSignature(IPN_PASSPHRASE, ipnData);

        const shaSignValid = receivedSignature === expectedSignature;

        if (!shaSignValid) {
            console.error(
                "IPN Error: Invalid SHA signature received from Digistore24. Data:",
                ipnData,
            );
            // Wenn die Signatur ungültig ist, sollten wir Digistore24 ein "OK" senden,
            // damit es die Anfrage nicht wiederholt. Die Verarbeitung wird abgebrochen.
            return new NextResponse("OK (Invalid Signature)", { status: 200 });
            // Alternativ könntest du einen 401 oder 500 senden, damit Digistore24 es erneut versucht.
            // Aber bei einer ungültigen Signatur ist dies meist nicht gewünscht.
        }
    }

    const event = getPostedValue(ipnData, "event");
    const apiMode = getPostedValue(ipnData, "api_mode"); // 'live' or 'test'
    const isTestMode = apiMode !== "live";

    console.log(`Digistore24 IPN Event received: ${event} (Mode: ${apiMode})`);

    try {
        // --- 2. Event-basierte Verarbeitung ---
        switch (event) {
            case "connection_test": {
                // Einfach "OK" zurückgeben.
                return new NextResponse("OK", { status: 200 });
            }

            case "on_payment": {
                const orderId = getPostedValue(ipnData, "order_id");
                const productId = getPostedValue(ipnData, "product_id");
                const productName = getPostedValue(ipnData, "product_name");
                const email = getPostedValue(ipnData, "email");
                const firstName = getPostedValue(ipnData, "address_first_name");
                const lastName = getPostedValue(ipnData, "address_last_name");
                const billingType = getPostedValue(ipnData, "billing_type");
                const paySequenceNo = getPostedValue(ipnData, "pay_sequence_no");
                const amount = parseFloat(getPostedValue(ipnData, "amount")); // Betrag kann als String kommen
                const currency = getPostedValue(ipnData, "currency");

                console.log(`IPN: on_payment for Order ID: ${orderId}, Product: ${productName}`);

                // --- Dein Datenbank-Update für neue Zahlungen / Bestellungen ---
                // Dies ist der Ort, wo du deine Prisma-Logik einfügst.
                // Stelle sicher, dass die Operation idempotent ist (z.B. `upsert` oder `create` nur, wenn nicht existent).
                try {
                    await db.order.upsert({
                        where: { digistoreOrderId: orderId },
                        update: {
                            // Update Felder bei wiederholter Zahlung oder wenn sich Daten ändern
                            status: "COMPLETED", // Annahme: Du hast einen Status im Modell
                            productName: productName,
                            customerEmail: email,
                            amount,
                            currency,
                            paySequenceNo: parseInt(paySequenceNo) || 0,
                            isTestOrder: isTestMode,
                        },
                        create: {
                            digistoreOrderId: orderId,
                            productId: productId,
                            productName: productName,
                            customerEmail: email,
                            firstName: firstName,
                            lastName: lastName,
                            billingType: billingType,
                            paySequenceNo: parseInt(paySequenceNo) || 0,
                            amount: amount,
                            currency: currency,
                            status: "COMPLETED",
                            isTestOrder: isTestMode,
                        },
                    });
                } catch(error) {
                    console.error('Order not found:', error);
                }

                await updateUserSubscription(email, productId, firstName);

                // Optional: Wenn du Mitgliedsdaten oder eine Thank You URL an Digistore24 zurückgeben möchtest.
                // Lies die Kommentare im ursprünglichen PHP-Skript dazu.
                // Dies erfordert spezifische IPN-Timing-Einstellungen bei Digistore24.
                const doTransferMembershipDataToDigistore = false;
                if (doTransferMembershipDataToDigistore) {
                    const username = "some_username";
                    const password = "some_password";
                    const loginUrl = "http://domain.com/login"; // Deine Login-URL
                    const thankyouUrl = "http://domain.com/thank_you"; // Deine Thank You URL
                    const headline = "Your access data";
                    const showOn = "all";
                    const hideOn = "invoice";

                    const responseBody = `OK\nthankyou_url: ${thankyouUrl}\nusername: ${username}\npassword: ${password}\nloginurl: ${loginUrl}\nheadline: ${headline}\nshow_on: ${showOn}\nhide_on: ${hideOn}`;
                    return new NextResponse(responseBody, {
                        status: 200,
                        headers: {
                            "Content-Type": "text/plain",
                        },
                    });
                }

                return new NextResponse("OK", { status: 200 });
            }

            case "on_payment_missed": {
                const orderId = getPostedValue(ipnData, "order_id");
                const email = getPostedValue(ipnData, "email");
                const productId = getPostedValue(ipnData, "product_id");
                console.log(`IPN: on_payment_missed for Order ID: ${orderId}`);
                // Logik: Markiere die Bestellung oder das Abonnement als überfällig/nicht bezahlt.
                try {
                    await db.order.update({
                        where: { digistoreOrderId: orderId },
                        data: { status: "PAYMENT_MISSED", lastUpdated: new Date() },
                    });
                } catch(error) {
                    console.error("Order not found:", error);
                }
                await cancelUserSubscription(email, productId);
                return new NextResponse("OK", { status: 200 });
            }

            case "on_refund": {
                const orderId = getPostedValue(ipnData, "order_id");
                const email = getPostedValue(ipnData, "email");
                const productId = getPostedValue(ipnData, "product_id");
                console.log(`IPN: on_refund for Order ID: ${orderId}`);
                // Logik: Bestellung als erstattet markieren und Zugang entziehen.
                try {
                    await db.order.update({
                        where: { digistoreOrderId: orderId },
                        data: { status: "REFUNDED", lastUpdated: new Date() },
                    });
                } catch(error) {
                    console.error("Order not found:", error);
                }
                await cancelUserSubscription(email, productId);
                return new NextResponse("OK", { status: 200 });
            }

            case "on_chargeback": {
                const orderId = getPostedValue(ipnData, "order_id");
                const email = getPostedValue(ipnData, "email");
                const productId = getPostedValue(ipnData, "product_id");
                console.log(`IPN: on_chargeback for Order ID: ${orderId}`);
                // Logik: Bestellung als Rückbuchung markieren und Zugang entziehen.
                try {
                    await db.order.update({
                        where: { digistoreOrderId: orderId },
                        data: { status: "CHARGEBACK", lastUpdated: new Date() },
                    });
                } catch(error) {
                    console.error("Order not found:", error);
                }
                await cancelUserSubscription(email, productId);
                return new NextResponse("OK", { status: 200 });
            }

            case "on_rebill_resumed": {
                const orderId = getPostedValue(ipnData, "order_id");
                console.log(`IPN: on_rebill_resumed for Order ID: ${orderId}`);
                // Logik: Abo-Status als "reaktiviert" markieren.
                // Wichtig: Dies ist KEINE Zahlung, nur eine Ankündigung, dass Digistore24 versucht, wieder zu belasten.
                try {
                    await db.order.update({
                        where: { digistoreOrderId: orderId },
                        data: { status: "REBILL_RESUMED", lastUpdated: new Date() },
                    });
                } catch(error) {
                    console.error("Order not found:", error);
                }
                return new NextResponse("OK", { status: 200 });
            }

            case "on_rebill_cancelled": {
                const orderId = getPostedValue(ipnData, "order_id");
                console.log(`IPN: on_rebill_cancelled for Order ID: ${orderId}`);
                // Logik: Abo-Status als "gekündigt" markieren.
                // Der Zugang sollte erst bei 'on_payment_missed' entzogen werden,
                // da das Abo bis zum Ende des aktuellen Zahlungszeitraums gültig bleibt.
                try {
                    await db.order.update({
                        where: { digistoreOrderId: orderId },
                        data: { status: "REBILL_CANCELLED", lastUpdated: new Date() },
                    });
                    return new NextResponse("OK", { status: 200 });
                } catch(error) {
                    console.error(error);
                    if(error instanceof Error) {
                        await db.log.create({
                            data: {
                                type: "ERROR",
                                message: error.message
                            }
                        });
                    }
                    return new NextResponse("OK", { status: 200 });
                }
            }

            case "on_affiliation": {
                const email = getPostedValue(ipnData, "email");
                const digistoreId = getPostedValue(ipnData, "affiliate_name");
                console.log(
                    `IPN: on_affiliation for email: ${email}, Digistore ID: ${digistoreId}`,
                );
                // Logik: Affiliate-Informationen speichern oder aktualisieren.
                // await db.affiliate.upsert({ /* ... */ });
                return new NextResponse("OK", { status: 200 });
            }

            default: {
                // Unbekannter Event-Typ. Protokollieren und trotzdem "OK" senden, um Endlosschleifen zu vermeiden.
                console.warn(`IPN: Unknown event type received: ${event}. Data:`, ipnData);
                return new NextResponse("OK", { status: 200 });
            }
        }
    } catch (error) {
        console.error("Error processing Digistore24 IPN:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ message: "Method Not Allowed" }, { status: 405 });
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

async function cancelUserSubscription(email: string, productName: string) {
  await api.user.updateSubscriptionDigistore({ email, productName });
}