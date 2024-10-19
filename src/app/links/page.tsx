import { api } from "@/trpc/server";
import { Links } from "../_components/links";

export default function Page() {
    void api.link.getAll.prefetch();

    return <Links />;
}