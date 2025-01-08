import { ConversionChart, LinkStats } from "@/app/_components/app/linkstats";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";

export default async function Page({ params }: { params: { id: string; } }) {
  const user = await api.user.get();
  if (!user!.admin && !user!.package) return redirect("/app/abo");

  const id = params.id;
  const link = await api.link.getLinkName({ id });
  if(!id || !link) return <p>Link konnte nicht gefunden werden</p>;

  await api.linkstats.getLinkVisits.prefetch({id});
  await api.linkstats.getLinkClicks.prefetch({id});

  return (
    <div className="container z-20 my-10 flex flex-col items-center justify-center p-5">
      <div className="my-5 flex w-1/2 flex-col items-center justify-center rounded-sm border border-white border-opacity-40 bg-zinc-950 bg-opacity-95 p-5 shadow-xl">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          Statistiken - {link.songtitle}
        </h2>
        <p>Der letzten 7 Tage</p>
        <LinkStats id={id} />
        <ConversionChart id={id} />
      </div>
    </div>
  );
}
