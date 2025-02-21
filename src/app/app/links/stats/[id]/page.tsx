import { LinkStatsOverview } from "@/app/_components/app/links/linkstats";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";

export default async function Page({ params }: { params: { id: string; } }) {
  const user = await api.user.get();
  if (!user!.admin && !user!.package) return redirect("/app/abo");

  const id = params.id;
  const link = await api.link.getLinkName({ id });
  if(!id || !link) return <p>Link konnte nicht gefunden werden</p>;

  return (
    <div className="container z-20 my-10 flex flex-col items-center justify-center p-5">
      <LinkStatsOverview id={id} />
    </div>
  );
}
