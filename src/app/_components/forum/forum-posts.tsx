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
import { Label } from "@/components/ui/label";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { IconArrowDown, IconArrowUp } from "@tabler/icons-react";

type Post = {
  votes: {
    up: number;
    down: number;
  };
  user: {
    name: string | null;
    image: string | null;
  };
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

export function ForumPosts({ threadId }: { threadId: string }) {
  const {
    data: posts,
    isLoading,
    isError,
  } = api.forum.getPosts.useQuery({ threadId });

  if (isLoading) return <p>Einträge werden geladen..</p>;
  if (isError) return <p>Fehler beim Laden der Einträge.</p>;

  return (
    <div className="flex w-full flex-col">
      {posts && posts.length !== 0 ? (
        <PostsTable posts={posts} />
      ) : (
        <p>In diesem Thread wurden noch keine Einträge erstellt.</p>
      )}
      <CreatePost threadId={threadId} />
    </div>
  );
}

function CreatePost({ threadId }: { threadId: string }) {
  const { toast } = useToast();
  const utils = api.useUtils();
  const [content, setContent] = useState<string>("");

  const createPost = api.forum.createPost.useMutation({
    onSuccess: async () => {
      await utils.forum.getPosts.invalidate();
      toast({
        variant: "default",
        title: "Der Eintrag wurde erstellt",
      });
      setContent("");
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="mt-2">
          Eintrag erstellen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Eintrag erstellen</DialogTitle>
          <DialogDescription>
            Hier kannst du einen Eintrag erstellen
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="content" className="text-right">
              Inhalt
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="submit"
              disabled={createPost.isPending}
              onClick={() =>
                createPost.mutate({
                  content,
                  threadId,
                })
              }
            >
              {createPost.isPending ? "Wird erstellt..." : "Erstellen"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PostsTable({ posts }: { posts: Post[] }) {
  const utils = api.useUtils();
  const setPostVote = api.forum.setPostVote.useMutation({
    onSuccess: async () => {
        await utils.forum.getVotes.invalidate();
        await utils.forum.getPosts.invalidate();
    }
  });

  return (
    <div>
      {posts.map((post, idx) => (
        <Card key={idx} className="my-1 bg-gray-200 dark:bg-neutral-950">
          <CardHeader className="flex flex-col">
            <div className="flex justify-between">
              <CardTitle className="cursor-pointer hover:bg-opacity-60 dark:hover:bg-opacity-60">
                {post.content}
              </CardTitle>
              {/* <p>{`${thread._count.posts} Einträge`}</p> */}
            </div>
            <div className="flex justify-between">
              <CardDescription>
                Erstellt am {post.createdAt.toLocaleString()} von{" "}
                {post.user.name ?? "Unknown"}
              </CardDescription>
              <div className="flex justify-end">
                {post.votes.up}
                <IconArrowUp
                  color="green"
                  className="cursor-pointer"
                  onClick={() =>
                    setPostVote.mutate({ vote: 1, postId: post.id })
                  }
                />
                <IconArrowDown
                  color="red"
                  className="cursor-pointer"
                  onClick={() =>
                    setPostVote.mutate({ vote: -1, postId: post.id })
                  }
                />
                {post.votes.down}
              </div>
              <p className="text-sm text-muted-foreground">{`Zuletzt aktualisiert: ${post.updatedAt.toLocaleString()}`}</p>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
