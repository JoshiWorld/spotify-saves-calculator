import { Links } from "@/app/_components/links";
import { api } from "@/trpc/server";

export default function Page() {
    void api.link.getAll.prefetch();
    void api.linkstats.getAll.prefetch();

    return <Links />;
}