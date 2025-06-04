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
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

const createPlaylistSchema = z.object({
    name: z.string().min(3, {
        message: "Der Name der Playlist muss mindestens 3 Buchstaben enthalten",
    }),
    playlistLink: z.string(),
});

export function CreatePlaylistAnalyse() {
    const { toast } = useToast();
    const utils = api.useUtils();
    const router = useRouter();

    const form = useForm<z.infer<typeof createPlaylistSchema>>({
        resolver: zodResolver(createPlaylistSchema),
        defaultValues: {
            name: "",
            playlistLink: ""
        },
    });

    const createLog = api.log.create.useMutation();

    const createPlaylist = api.playlistAnalyse.create.useMutation({
        onSuccess: async () => {
            await utils.playlistAnalyse.invalidate();
            toast({
                variant: "default",
                title: "Die Playlist wurde hinzugefügt",
            });
            router.push("/app/playlist/analyse");
        },
        onError: (error) => {
            console.error("Fehler beim Hinzufügen der Playlist:", error);
            createLog.mutate({
                message: error.message,
                logtype: LogType.ERROR.toString(),
            });
            toast({
                variant: "destructive",
                title: "Fehler beim Hinzufügen der Playlist",
            });
        },
    });

    async function onSubmit(values: z.infer<typeof createPlaylistSchema>) {
        createPlaylist.mutate({
            name: values.name,
            playlistLink: values.playlistLink
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
                                <Input {...field} />
                            </FormControl>
                            <FormDescription>Du kannst diesen Link nach dem Erstellen nicht mehr bearbeiten.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={createPlaylist.isPending}>
                    {createPlaylist.isPending ? "Wird hinzugefügt..." : "Playlist hinzufügen"}
                </Button>
            </form>
        </Form>
    );
}