import { Links } from "@/app/_components/app/links";
import { Stats } from "@/app/_components/app/stats";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await api.user.get();
  if (!user?.admin && !user?.package) return redirect("/app/abo");

  await api.link.getAllView.prefetch();
  await api.linkstats.getVisits.prefetch();
  await api.linkstats.getClicks.prefetch();

  return (
    <div className="container z-20 my-10 flex flex-col items-center justify-center p-5">
      <div className="my-5 flex w-1/2 flex-col items-center justify-center rounded-sm border border-white border-opacity-40 bg-zinc-950 bg-opacity-95 p-5 shadow-xl">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          Statistiken
        </h2>
        <p>Der letzten 7 Tage</p>
        <Stats />
      </div>

      <div className="m-5 flex w-full flex-col items-center justify-center gap-5 rounded-sm border border-white border-opacity-40 bg-zinc-950 bg-opacity-95 p-5 shadow-xl">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          SmartLinks
        </h2>
        <Links />
      </div>
    </div>
  );
}
