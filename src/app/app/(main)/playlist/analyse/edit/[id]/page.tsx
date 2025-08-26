import { EditPlaylistAnalyse } from "@/app/_components/app/playlist/analyse/EditPlaylistAnalyse";

type Props = {
  id: string;
}

type PageProps = {
  params: Promise<Props>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
          <EditPlaylistAnalyse id={id} />
        </div>
      </div>
    </div>
  )
}
