import { Campaigns } from "@/app/_components/app/campaigns";

type Props = {
  projectId: string;
};

type PageProps = {
  params: Promise<Props>;
};

export default async function Page({ params }: PageProps) {
  const { projectId } = await params;

  return <Campaigns projectId={projectId} />;
}
