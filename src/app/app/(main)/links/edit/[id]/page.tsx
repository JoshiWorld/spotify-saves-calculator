import { EditLink } from "@/app/_components/app/links/edit-link";
import { api } from "@/trpc/server";

type Props = {
  id: string;
}

type PageProps = {
  params: Promise<Props>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const link = await api.link.getLinkName({ id });
  if (!id || !link) return <p>Link konnte nicht gefunden werden</p>;

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
          <EditLink id={id} />
        </div>
      </div>
    </div>
  )
}
