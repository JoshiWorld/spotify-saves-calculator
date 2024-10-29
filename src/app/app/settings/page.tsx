import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RemoveMetaAccess } from "@/app/_components/meta/remove-meta-access";
import { UserSettings } from "@/app/_components/user-settings";

export default async function Page() {
    const session = await getServerAuthSession();

    if(!session?.user) return <p>Nicht eingeloggt</p>;

    await api.user.get.prefetch();
    const user = await api.user.get();

    return (
      <div className="my-10 flex flex-col items-center">
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