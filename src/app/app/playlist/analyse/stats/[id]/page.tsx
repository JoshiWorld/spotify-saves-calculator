import { PlaylistStatsOverview } from "@/app/_components/app/playlist/analyse/PlaylistAnalyseStatsId";

type Props = {
  id: string;
};

type PageProps = {
  params: Promise<Props>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="container z-20 my-10 flex flex-col items-center justify-center p-5">
      <PlaylistStatsOverview id={id} />
    </div>
  );
}
