import { PricingLoggedIn } from "@/app/_components/app/pricing";
// import { api } from "@/trpc/server";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Upgrade dein Abo | SmartSavvy",
  description: "Hier kannst du dein Abo hochstufen oder ändern.",
};

export default async function Page() {
  // await api.product.getAll.prefetch();

  return (
    <div>
      <PricingLoggedIn />
    </div>
  );
}
