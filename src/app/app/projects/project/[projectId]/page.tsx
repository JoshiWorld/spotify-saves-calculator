import { Campaigns } from "@/app/_components/app/campaigns";

export default async function Page({params}: { params: { projectId: string } }) {
    const projectId = params.projectId;

    return <Campaigns projectId={projectId} />;
}