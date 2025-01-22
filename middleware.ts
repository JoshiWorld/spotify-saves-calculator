// import { type NextRequest, NextResponse } from "next/server";

// export function middleware(req: NextRequest) {
//   const { pathname } = req.nextUrl;

//   // Überwache nur die Startseite
//   if (pathname === "/") {
//     // Beispiel: IP-Adresse und User-Agent speichern
//     const ip = req.ip ?? req.headers.get("x-forwarded-for") ?? "Unbekannt";
//     const userAgent = req.headers.get("user-agent") ?? "Unbekannt";

//     console.log(
//       `Besuch auf der Startseite: IP: ${ip}, User-Agent: ${userAgent}`,
//     );

//     // Du könntest die Daten auch an einen Tracking-Service senden
//     // await fetch('https://example.com/api/track', {
//     //   method: 'POST',
//     //   body: JSON.stringify({ ip, userAgent }),
//     //   headers: { 'Content-Type': 'application/json' },
//     // });
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/", "/about"], // Hier kannst du festlegen, welche Routen überwacht werden
// };
