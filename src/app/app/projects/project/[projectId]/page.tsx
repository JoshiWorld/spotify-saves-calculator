import { Campaigns } from "@/app/_components/app/campaigns";
import { api } from "@/trpc/server";

export default async function Page({params}: { params: { projectId: string } }) {
    const projectId = params.projectId;
    const project = await api.project.get({ id: projectId }) ?? null;

    if(!project) return <p>Das Projekt konnte nicht gefunden werden.</p>;
    
    await api.campaign.getAll.prefetch({ projectId });

    return <Campaigns projectId={projectId} />;
}