import { SiteHeader, SiteHeaderLinks } from "@/app/_components/app/site-header";
import { api } from "@/trpc/server";

type Props = {
    projectId: string;
}

type PageProps = {
    params: Promise<Props>
}

export default async function ProjectIDHeader({ params }: PageProps) {
    const { projectId } = await params;
    const project = await api.project.getProjectName({ id: projectId });

    if (!projectId || !project) {
        return <SiteHeader title="SavesCalculator -> ID" />;
    }

    const steps = [
        {
            text: "SavesCalculator",
            url: "/app/projects"
        },
        {
            text: project.name,
            url: `/app/projects/project/${projectId}`
        }
    ];

    return <SiteHeaderLinks steps={steps} />;
}