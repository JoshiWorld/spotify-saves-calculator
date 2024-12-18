import { PricingLoggedIn } from "@/app/_components/app/pricing";
import { api } from "@/trpc/server";

export default async function Page() {
    await api.product.getAll.prefetch();

    return (
      <div>
        <PricingLoggedIn />
      </div>
    );
}