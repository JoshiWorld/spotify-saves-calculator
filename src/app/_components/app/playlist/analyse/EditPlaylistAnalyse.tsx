"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/trpc/react";
import { LogType } from "@prisma/client";
import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

const createPlaylistSchema = z.object({
    name: z.string().min(3, {
        message: "Der Name der Playlist muss mindestens 3 Buchstaben enthalten",
    }),
    playlistLink: z.string()
});

export function EditPlaylistAnalyse({ id }: { id: string }) {
    const { toast } = useToast();
    const utils = api.useUtils();
    const router = useRouter();

    const { data: playlist, isLoading } = api.playlistAnalyse.get.useQuery({id});

    const createLog = api.log.create.useMutation();
    const updatePlaylist = api.playlistAnalyse.update.useMutation({
        onSuccess: async () => {
            await utils.playlistAnalyse.invalidate();
            toast({
                variant: "default",
                title: "Die Playlist wurde geupdated",
            });
            router.push("/app/playlist/analyse");
        },
        onError: (error) => {
            console.error("Fehler beim Updaten der Playlist:", error);
            createLog.mutate({
                message: error.message,
                logtype: LogType.ERROR.toString(),
            });
            toast({
                variant: "destructive",
                title: "Fehler beim Updaten der Playlist",
            });
        },
    });

    const form = useForm<z.infer<typeof createPlaylistSchema>>({
        resolver: zodResolver(createPlaylistSchema),
        defaultValues: {
            name: "",
            playlistLink: ""
        },
    });

    useEffect(() => {
        if (playlist) {
            form.setValue("name", playlist.name);
            form.setValue("playlistLink", playlist.playlistId);
        }
    }, [playlist, form]);

    if (isLoading) return <p>Daten werden geladen..</p>;
    if (!playlist) return <p>Fehler beim Laden der Daten.</p>;

    async function onSubmit(values: z.infer<typeof createPlaylistSchema>) {
        updatePlaylist.mutate({
            id,
            name: values.name
        });
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full max-w-md space-y-8"
            >
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Playlist-Name</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Sommervibes 2025"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="playlistLink"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Link zu deiner Spotify-Playlist*</FormLabel>
                            <FormControl>
                                <Input {...field} disabled />
                            </FormControl>
                            <FormDescription>Du kannst deine PlaylistID nicht bearbeiten.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={updatePlaylist.isPending}>
                    {updatePlaylist.isPending ? "Wird gespeichert..." : "Speichern"}
                </Button>
            </form>
        </Form>
    );
}
