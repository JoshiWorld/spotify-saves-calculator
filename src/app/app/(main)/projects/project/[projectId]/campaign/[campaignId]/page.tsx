import { PostsViewSwitch } from "@/app/_components/appNew/projects/posts-view-switch";
import { type Metadata } from "next";

type Props = {
  campaignId: string;
};

type PageProps = {
  params: Promise<Props>;
};

export const metadata: Metadata = {
  title: "Spotify Saves Calculator | SmartSavvy",
  description: "Deine Projekte aus dem Spotify Saves Calculator",
};

export default async function Page({ params }: PageProps) {
  const { campaignId } = await params;

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <PostsViewSwitch campaignId={campaignId} />
      </div>
    </div>
  );
}
