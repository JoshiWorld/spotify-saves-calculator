import { Hero } from "@/app/_components/landing/hero";
import { Features } from "@/app/_components/landing/features";
import { Pricing } from "@/app/_components/landing/pricing";
import { CTA } from "@/app/_components/landing/cta";
import { Navbar } from "@/app/_components/landing/navbar";
import { Footer } from "@/app/_components/landing/footer";
import Head from "next/head";

export default async function Home() {
  return (
    <>
      <Head>
        <title>SmartSavvy</title>
        <meta
          name="description"
          content="Dein Tool zur Verbesserung der Performance deiner Werbekampagnen!"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: `
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "SmartSavvy",
            "url": "https://smartsavvy.eu",
            "logo": "https://smartsavvy.eu/logo.png"
          }
        `,
          }}
        />
      </Head>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
