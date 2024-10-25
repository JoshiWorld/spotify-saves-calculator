import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";

import { TRPCReactProvider } from "@/trpc/react";
import { ThemeProvider } from "@/components/theme-provider";
import { HydrateClient } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Spotify Saves Calculator",
  description: "Tool um Spotify CPS (Cost per Save) zu kalkulieren",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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
              <Toaster />
            </HydrateClient>
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
