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
  // twitter: {
  //   card: "summary_large_image",
  //   title: "SmartSavvy - Dein Tool zur Verbesserung der Performance",
  //   description:
  //     "Effizientes Tracking, Optimierung und Analyse für Werbekampagnen.",
  //   images: ["/images/smart-savvy-twitter-card.jpg"],
  // },
  alternates: {
    canonical: "https://smartsavvy.eu",
    languages: {
      "de-DE": "https://smartsavvy.eu",
    },
  },
  keywords: [
    "Werbekampagnen",
    "Performance",
    "Tracking",
    "Optimierung",
    "SmartSavvy",
    "Analytics Tool",
    "Spotify",
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
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <TRPCReactProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <HydrateClient>
              {children}
              <SpeedInsights />
              <Analytics />
              <CookieBanner />
              <Toaster />
            </HydrateClient>
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
