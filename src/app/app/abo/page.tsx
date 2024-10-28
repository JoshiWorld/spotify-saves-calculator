import { Pricing } from "@/app/_components/pricing";
import { api } from "@/trpc/server";

export default async function Page() {
    await api.product.getAll.prefetch();

    return (
        <div>
            <Pricing />
        </div>
    );
}