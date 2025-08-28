import { SiteHeader } from "@/app/_components/app/site-header";
import { api } from "@/trpc/server";

type Props = {
    id: string;
}

type PageProps = {
    params: Promise<Props>
}

export default async function AppLinksHeader({ params }: PageProps) {
    const { id } = await params;
    const link = await api.link.getLinkName({ id });

    if(!id || !link) {
        return <SiteHeader title="Smartlinks -> Bearbeiten" />;
    }

    return <SiteHeader title={`Smartlinks -> Bearbeiten -> ${link.songtitle}`} />;
}