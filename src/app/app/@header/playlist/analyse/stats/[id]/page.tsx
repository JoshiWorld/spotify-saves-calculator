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
    const playlistAnalyse = await api.playlistAnalyse.getPlaylistName({ id });

    if (!id || !playlistAnalyse) {
        return <SiteHeader title="PlaylistAnalyser -> Stats" />;
    }

    return <SiteHeader title={`PlaylistAnalyser -> Stats -> ${playlistAnalyse.name}`} />;
}