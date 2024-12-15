import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RemoveMetaAccess } from "@/app/_components/app/meta/remove-meta-access";
import { UserSettings } from "@/app/_components/app/user-settings";

export default async function Page() {
    const session = await getServerAuthSession();

    if(!session?.user) return <p>Nicht eingeloggt</p>;

    await api.user.get.prefetch();
    const user = await api.user.get();

    return (
      <div className="container z-20 my-20 flex flex-col items-center justify-center rounded-sm border border-white border-opacity-40 bg-zinc-950 bg-opacity-95 p-5 shadow-xl">
        {!user?.metaAccessToken ? (
          <Link href="/api/meta/login">
            <Button>Meta Account Verbinden</Button>
          </Link>
        ) : (
          <RemoveMetaAccess />
        )}
        <UserSettings />
      </div>
    );
}