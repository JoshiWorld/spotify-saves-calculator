import { api } from "@/trpc/server";
import { Links } from "../_components/links";

export default function Page() {
    void api.link.getAll.prefetch();
    void api.linkstats.getAll.prefetch();

    return <Links />;
}