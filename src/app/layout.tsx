import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";

import { TRPCReactProvider } from "@/trpc/react";
import { ThemeProvider } from "@/components/theme-provider";
import { Footer } from "./_components/footer";
import { getServerAuthSession } from "@/server/auth";
import { NavbarLoggedIn } from "./_components/navbar";
import { HydrateClient } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Spotify Saves Calculator",
  description: "Tool um Spotify CPS (Cost per Save) zu kalkulieren",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerAuthSession();

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
              {session?.user && <NavbarLoggedIn />}

              <main className="flex flex-col items-center justify-center bg-background">
                {children}
              </main>
              <Toaster />
              <Footer />
            </HydrateClient>
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
