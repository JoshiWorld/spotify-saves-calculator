import { Links } from "@/app/_components/links";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";

export default async function Page() {
    const user = await api.user.get();
    if (!user?.admin || !user.package) return redirect("/app/abo");

    await api.link.getAll.prefetch();
    await api.linkstats.getAll.prefetch();

    return <Links />;
}