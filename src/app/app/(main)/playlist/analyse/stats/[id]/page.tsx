import { PlaylistAnalyseStatsCardView } from "@/app/_components/app/playlist/analyse/PlaylistAnalyseStats";

type Props = {
  id: string;
};

type PageProps = {
  params: Promise<Props>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <PlaylistAnalyseStatsCardView id={id} />
      </div>
    </div>
  );
}
