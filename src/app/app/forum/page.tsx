import { ForumSidebar } from "@/app/_components/forum/forum";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";

export default async function Forum() {
    const user = await api.user.get();
    if(!user?.admin || !user.package) return redirect('/app/abo');

    await api.forum.getCategories.prefetch();

    return <ForumSidebar />;
}