import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";
import { UserSettings } from "../_components/user-settings";

export default async function Page() {
    const session = await getServerAuthSession();

    if(!session?.user) return <p>Nicht eingeloggt</p>;

    void api.user.get.prefetch();

    return <UserSettings />;
}