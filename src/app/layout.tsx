import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";

import { TRPCReactProvider } from "@/trpc/react";
import { ThemeProvider } from "@/components/theme-provider";
import { HydrateClient } from "@/trpc/server";
import { CookieBanner } from "./_components/links/cookie-banner";

import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import { CookiePreferenceProvider } from "@/contexts/CookiePreferenceContext";
import { AxiomWebVitals } from "next-axiom";
import { GTMBody, GTMHead } from "./_components/gtm";

export const metadata: Metadata = {
  title:
    "SmartSavvy - Dein Tool zur Verbesserung der Performance deiner Werbekampagnen",
  description:
    "Steigere die Performance deiner Werbekampagnen mit SmartSavvy. Ein leistungsstarkes Tool für das Kampagnen-Tracking, die Optimierung und Analyse für mehr Erfolg in der digitalen Werbung.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  openGraph: {
    title: "SmartSavvy",
    description:
      "Dein Tool zur Verbesserung der Performance deiner Werbekampagnen!",
    url: "https://smartsavvy.eu",
    siteName: "SmartSavvy",
    images: [
      {
        url: "/images/logo.png",
        width: 1200,
        height: 630,
        alt: "SmartSavvy - Dein Tool zur Optimierung von Werbekampagnen",
      },
    ],
    locale: "de_DE",
    type: "website",
  },
  alternates: {
    canonical: "https://smartsavvy.eu",
    languages: {
      "de-DE": "https://smartsavvy.eu",
    },
  },
  keywords: [
    "Werbekampagnen",
    "Performance",
    "Optimierung",
    "SmartSavvy",
    "Analysetool",
    "Spotify",
    "Smartlink",
    "Musikmarketing Deutschland",
    "Musik bewerben",
    "Spotify Promotion Deutschland",
    "Reichweite als Musiker erhöhen",
    "Musikpromotion Kosten",
    "Social Media Marketing für Musiker",
    "Wie bekomme ich mehr Streams",
    "Musik auf TikTok promoten",
    "Fans gewinnen als Musiker",
    "Musikvertrieb und Marketing",
    "Wie vermarkte ich meine Musik in Deutschland",
    "Erfolgreiches Instagram Marketing für Musiker",
    "Musikpromotion für Indie-Künstler Deutschland",
    "Spotify Algorithmus verstehen Musik",
    "Konzerttickets besser verkaufen Strategien",
  ],
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode; params: { id: string } }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`} suppressHydrationWarning>
      <GTMHead />
      <AxiomWebVitals />
      <body>
        <GTMBody />
        <TRPCReactProvider>
          <ThemeProvider>
            <HydrateClient>
              <CookiePreferenceProvider>
                {children}
                <SpeedInsights />
                <Analytics />
                <CookieBanner />
                <Toaster />
              </CookiePreferenceProvider>
            </HydrateClient>
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
