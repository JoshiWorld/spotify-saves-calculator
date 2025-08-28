import { ForumChat } from "@/app/_components/forum/chat";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";

export default async function Forum() {
  const user = await api.user.get();
  if (!user?.admin && !user?.package) return redirect('/app/abo');

  return (
    <div className="flex flex-col items-center w-full">
      <ForumChat />
    </div>
  );
}