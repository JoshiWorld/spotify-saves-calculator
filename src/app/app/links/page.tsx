import { Links } from "@/app/_components/links";
import { api } from "@/trpc/server";

export default async function Page() {
    await api.link.getAll.prefetch();
    await api.linkstats.getAll.prefetch();

    return <Links />;
}