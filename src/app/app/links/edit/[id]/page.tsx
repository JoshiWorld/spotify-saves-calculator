import { EditLink } from "@/app/_components/app/links/edit-link";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";

type Props = {
  id: string;
}

type PageProps = {
  params: Promise<Props>
}

export default async function Page({ params }: PageProps) {
  const user = await api.user.get();
  if (!user?.admin && !user?.package) return redirect("/app/abo");

  const { id } = await params;
  const link = await api.link.getLinkName({ id });
  if (!id || !link) return <p>Link konnte nicht gefunden werden</p>;

  return (
    <div className="container z-20 my-10 flex max-w-xl flex-col items-center justify-center p-5">
      <div className="m-5 flex w-full flex-col items-center justify-center gap-5 rounded-sm border border-white border-opacity-40 bg-zinc-950 bg-opacity-95 p-5 shadow-xl">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          Link bearbeiten
        </h2>
        <EditLink id={id} />
      </div>
    </div>
  );
}
