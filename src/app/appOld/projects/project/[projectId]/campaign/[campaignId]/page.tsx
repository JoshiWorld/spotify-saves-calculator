import { Posts } from "@/app/_components/app/posts";
import { api } from "@/trpc/server";

type Props = {
  campaignId: string;
};

type PageProps = {
  params: Promise<Props>;
};

export default async function Page({ params }: PageProps) {
  const { campaignId } = await params;
  const campaign = (await api.campaign.get({ id: campaignId })) ?? null;

  if (!campaign) return <p>Die Kampagne konnte nicht gefunden werden.</p>;

  await api.post.getAll.prefetch({ campaignId });

  return <Posts campaignId={campaignId} />;
}
