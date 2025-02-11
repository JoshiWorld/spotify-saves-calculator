import { SpotifyCallback } from "@/app/_components/app/admin/spotify/callback";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await api.user.get();
  if (!user?.admin) redirect("/app");

  return (
    <div className="container z-20 my-20 flex flex-col items-center justify-center rounded-sm border border-white border-opacity-40 bg-zinc-950 bg-opacity-95 p-5 shadow-xl max-w-md">
      <SpotifyCallback />
    </div>
  );
}
