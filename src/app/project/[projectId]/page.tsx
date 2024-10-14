import { Campaigns } from "@/app/_components/campaigns";
import { api, HydrateClient } from "@/trpc/server";

export default async function Page({params}: { params: { projectId: string } }) {
    const projectId = params.projectId;
    const project = await api.project.get({ id: projectId }) ?? null;

    if(!project) return <p>Das Projekt konnte nicht gefunden werden.</p>;
    
    void api.campaign.getAll.prefetch({projectId});

    return (
      <HydrateClient>
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <Campaigns projectId={projectId} />
        </div>
      </HydrateClient>
    );
}