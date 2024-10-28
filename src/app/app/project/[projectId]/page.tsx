import { Campaigns } from "@/app/_components/campaigns";
import { api } from "@/trpc/server";

export default async function Page({params}: { params: { projectId: string } }) {
    const projectId = params.projectId;
    const project = await api.project.get({ id: projectId }) ?? null;

    if(!project) return <p>Das Projekt konnte nicht gefunden werden.</p>;
    
    // void api.campaign.getAll.prefetch({projectId});

    return <Campaigns projectId={projectId} />;
}