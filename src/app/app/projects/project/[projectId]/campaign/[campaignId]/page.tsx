import { Posts } from "@/app/_components/app/posts";
import { api } from "@/trpc/server";

export default async function Page({
  params,
}: {
  params: { campaignId: string };
}) {
  const campaignId = params.campaignId;
  const campaign = (await api.campaign.get({ id: campaignId })) ?? null;

  if (!campaign) return <p>Die Kampagne konnte nicht gefunden werden.</p>;

  await api.post.getAll.prefetch({ campaignId });

  return <Posts campaignId={campaignId} />;
}
