import { ForumChat } from "@/app/_components/forum/chat";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";

export default async function Forum() {
  const user = await api.user.get();
  if (!user?.admin && !user?.package) return redirect('/app/abo');

  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Forum
      </h2>
      <ForumChat />
    </div>
  );
}