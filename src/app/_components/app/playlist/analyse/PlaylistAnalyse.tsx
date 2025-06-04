"use client";

import { api } from "@/trpc/react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    FileEditIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

type PlaylistsAnalyseView = {
    id: string;
    name: string;
    playlistId: string;
};

export function PlaylistAnalyse() {
    const router = useRouter();
    const [playlists] = api.playlistAnalyse.getAll.useSuspenseQuery();

    return (
        <div className="flex w-full flex-col">
            {playlists.length !== 0 ? (
                <PlaylistsTable playlists={playlists} />
            ) : (
                <p>Du hast noch keine Playlist hinzugefügt</p>
            )}
            <Button
                variant="default"
                className="mt-2"
                onClick={() => router.push("/app/playlist/analyse/create")}
            >
                Playlist hinzufügen
            </Button>
        </div>
    );
}

function PlaylistsTable({ playlists }: { playlists: PlaylistsAnalyseView[] }) {
    const router = useRouter();
    const utils = api.useUtils();
    const { toast } = useToast();

    const deletePlaylist = api.playlistAnalyse.delete.useMutation({
        onSuccess: async () => {
            await utils.playlistAnalyse.invalidate();
            toast({
                variant: "destructive",
                title: "Die Playlist wurde erfolgreich gelöscht",
            });
        },
        onError: (error) => {
            console.error("Fehler beim Löschen der Playlist:", error);
            toast({
                variant: "destructive",
                title: "Fehler beim Löschen der Playlist",
            });
        },
    });

    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[500px]">Name</TableHead>
                        <TableHead>PlaylistID</TableHead>
                        <TableHead className="w-[100px] text-center">Aktionen</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {playlists.map((playlist) => (
                        <TableRow key={`${playlist.id}`}>
                            <TableCell
                                className="font-medium hover:cursor-pointer hover:underline"
                                onClick={() => router.push(`/app/playlist/analyse/stats/${playlist.id}`)}
                            >
                                {`${playlist.name}`}
                            </TableCell>
                            <TableCell>{playlist.playlistId}</TableCell>
                            <TableCell className="flex items-center justify-between">
                                <FileEditIcon
                                    className="transition-colors hover:cursor-pointer hover:text-yellow-500"
                                    // onClick={() => setEditingLink(link.id)}
                                    onClick={() => router.push(`/app/playlist/analyse/edit/${playlist.id}`)}
                                />
                                <IconTrash
                                    className="transition-colors hover:cursor-pointer hover:text-red-500"
                                    onClick={() => deletePlaylist.mutate({ id: playlist.id })}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
