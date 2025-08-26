import { SiteHeader, SiteHeaderLinks } from "@/app/_components/app/site-header";
import { api } from "@/trpc/server";

type Props = {
    campaignId: string;
}

type PageProps = {
    params: Promise<Props>
}

export default async function CampaignIDHeader({ params }: PageProps) {
    const { campaignId } = await params;
    const campaign = await api.campaign.getCampaignName({ id: campaignId });

    if (!campaignId || !campaign) {
        return <SiteHeader title="SavesCalculator -> ID -> ID" />;
    }

    const steps = [
        {
            text: "SavesCalculator",
            url: "/app/projects"
        },
        {
            text: campaign.project.name,
            url: `/app/projects/project/${campaign.project.id}`
        },
        {
            text: campaign.name,
            url: `/app/projects/project/${campaign.project.id}/campaign/${campaignId}`
        }
    ];

    return <SiteHeaderLinks steps={steps} />;
}