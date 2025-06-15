"use client";

import { useToast } from "@/hooks/use-toast";
import { api } from "@/trpc/react";
import { useEffect, useRef, useState } from "react";
import Pusher from "pusher-js";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/ui/loading";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvatarIcon } from "@radix-ui/react-icons";

interface ChatMessage {
    id: string;
    message: string;
    userName: string;
    timestamp: string;
    userId: string;
    image: string | null | undefined;
}

const CHAT_CHANNEL = "forum-chat";
const NEW_MESSAGE_EVENT = "new-message";

const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY!;
const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER!;

export function ForumChat() {
    const { toast } = useToast();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const sendMessageMutation = api.chat.sendMessage.useMutation({
        onSuccess: (data) => {
            console.log("Message sent!", data);
        },
        onError: (err) => {
            console.error("Fehler beim Senden der Nachricht:", err);
            toast({
                variant: "destructive",
                title:
                    "Fehler beim Senden der Nachricht.",
                description: "Versuche es später erneut!"
            });
        }
    });

    const { data: initialMessages, isLoading: isLoadingInitialMessages } = api.chat.getMessages.useQuery({ limit: 50 });

    useEffect(() => {
        if (initialMessages) {
            setMessages(initialMessages);
        }
    }, [initialMessages]);

    useEffect(() => {
        const pusher = new Pusher(PUSHER_KEY, {
            cluster: PUSHER_CLUSTER
        });

        const channel = pusher.subscribe(CHAT_CHANNEL);

        channel.bind(NEW_MESSAGE_EVENT, (data: ChatMessage) => {
            console.log("Neue Nachricht erhalten:", data);
            setMessages((prevMessages) => [...prevMessages, data]);
        });

        return () => {
            if (channel) {
                pusher.unsubscribe(CHAT_CHANNEL);
            }
            pusher.disconnect();
        };
    }, []);

    useEffect(() => {
        if (initialMessages) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, initialMessages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === "") return;

        sendMessageMutation.mutate({ message: newMessage });
        setNewMessage("");
    };

    const isSending = sendMessageMutation.isPending;

    return (
        <div className="flex h-[600px] w-full max-w-3xl flex-col rounded-lg bordershadow-xl">
            <div className="flex-1 overflow-y-auto p-4">
                {isLoadingInitialMessages ? (
                    <p className="text-center">Lade Nachrichten...</p>
                ) : messages.length === 0 ? (
                    <p className="text-center">Noch keine Nachrichten...</p>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className="mb-3 flex items-center gap-2">
                            <Avatar>
                                <AvatarImage src={msg.image ?? ""} />
                                <AvatarFallback>
                                    <AvatarIcon className="h-full w-full" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col w-full">
                                <span className="text-xs">
                                    {msg.userName} ({`${new Date(msg.timestamp).toLocaleDateString()} um ${new Date(msg.timestamp).toLocaleTimeString()}`}):
                                </span>
                                <p className="rounded-lg bg-gradient-to-r from-zinc-900 to-zinc-900 p-2 shadow-sm ">
                                    {msg.message}
                                </p>
                            </div>
                        </div>
                    ))
                )}
                {/* <div ref={messagesEndRef} /> */}
            </div>

            <form onSubmit={handleSubmit} className="flex border-t p-4">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Nachricht eingeben..."
                    className="flex-1 rounded-l-lg border p-2 focus:border-primary bg-zinc-900 focus:outline-none transition"
                    disabled={isSending}
                />
                {/* <Button type="submit" disabled={isSending} className="rounded-r-lg px-4 py-2 disabled:opacity-50">
                    {isSending ? "Sende..." : "Senden"}
                </Button> */}
                <button
                    type="submit"
                    className="rounded-r-lg bg-primary px-4 py-2 text-white hover:bg-purple-800 disabled:opacity-50 transition"
                    disabled={isSending}
                >
                    {isSending ? "Sende..." : "Senden"}
                </button>
            </form>
        </div>
    );
}