import { Posts } from "@/app/_components/posts";
import { api, HydrateClient } from "@/trpc/server";

export default async function Page({
  params,
}: {
  params: { campaignId: string };
}) {
  const campaignId = params.campaignId;
  const campaign = (await api.campaign.get({ id: campaignId })) ?? null;

  if (!campaign) return <p>Die Kampagne konnte nicht gefunden werden.</p>;

  void api.post.getAll.prefetch({ campaignId });

  return (
    <HydrateClient>
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <Posts campaignId={campaignId} />
      </div>
    </HydrateClient>
  );
}
