import { Hero } from "@/app/_components/landing/hero";
import { Features } from "@/app/_components/landing/features";
import { Pricing } from "@/app/_components/landing/pricing";
import { CTA } from "@/app/_components/landing/cta";
import { Navbar } from "@/app/_components/landing/navbar";
import { Footer } from "@/app/_components/landing/footer";

export default async function Home() {
  return (
    <>
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
