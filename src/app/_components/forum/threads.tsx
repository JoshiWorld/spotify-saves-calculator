"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";

type Thread = {
  user: {
    name: string | null;
  };
  id: string;
  _count: {
    posts: number;
  };
  title: string;
  createdAt: Date;
  updatedAt: Date;
};

export function Threads({ threads, categoryId }: { threads: Thread[]; categoryId: string }) {
  return (
    <div className="flex w-full flex-col">
      {threads.length !== 0 ? (
        <ThreadsTable threads={threads} categoryId={categoryId} />
      ) : (
        <p>In dieser Kategorie wurden noch keine Threads erstellt.</p>
      )}
      <CreateThread categoryId={categoryId} />
    </div>
  );
}

function CreateThread({ categoryId }: { categoryId: string }) {
  const { toast } = useToast();
  const utils = api.useUtils();
  const [title, setTitle] = useState<string>("");

  const createThread = api.forum.createThread.useMutation({
    onSuccess: async () => {
      await utils.forum.getThreads.invalidate();
      toast({
        variant: "default",
        title: "Der Thread wurde erstellt",
        description: `Name: ${title}`,
      });
      setTitle("");
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="mt-2">
          Thread erstellen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thread erstellen</DialogTitle>
          <DialogDescription>
            Hier kannst du einen Thread erstellen
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Titel
            </Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="submit"
              disabled={createThread.isPending}
              onClick={() =>
                createThread.mutate({
                  title,
                  categoryId,
                })
              }
            >
              {createThread.isPending ? "Wird erstellt..." : "Erstellen"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ThreadsTable({ threads, categoryId }: { threads: Thread[]; categoryId: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const setThread = (threadsId: string) => {
        const currentParams = new URLSearchParams(searchParams.toString());
        currentParams.set("categoryId", categoryId);
        currentParams.set("threadsId", threadsId);

        router.push(`?${currentParams.toString()}`);
    }

  return (
    <div>
      {threads.map((thread, idx) => (
        <Card
          key={idx}
          className="cursor-pointer bg-gray-200 dark:bg-neutral-950 dark:hover:bg-opacity-60 hover:bg-opacity-60 my-1"
          onClick={() => setThread(thread.id)}
        >
          <CardHeader className="flex flex-col">
            <div className="flex justify-between">
              <CardTitle>{thread.title}</CardTitle>
              <p>{`${thread._count.posts} Einträge`}</p>
            </div>
            <div className="flex justify-between">
              <CardDescription>
                Erstellt am {thread.createdAt.toLocaleString()} von{" "}
                {thread.user.name ?? "Unknown"}
              </CardDescription>
              <p className="text-sm text-muted-foreground">{`Zuletzt aktualisiert: ${thread.updatedAt.toLocaleString()}`}</p>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}