import { PricingLoggedIn } from "@/app/_components/app/pricing";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Upgrade dein Abo | SmartSavvy",
  description: "Hier kannst du dein Abo hochstufen oder ändern.",
};

export default async function Page() {

  return (
    <div>
      <PricingLoggedIn />
    </div>
  );
}
