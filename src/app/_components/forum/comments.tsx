"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export function ViewComments({
  postId,
  onClose,
}: {
  postId: string;
  onClose: () => void;
}) {
  const utils = api.useUtils();
  const [content, setContent] = useState<string>("");
  const { data: comments } = api.forum.getComments.useQuery({ postId });

  const createComment = api.forum.createComment.useMutation({
    onSuccess: async () => {
      await utils.forum.getPosts.invalidate();
      await utils.forum.getComments.invalidate();
      setContent("");
    },
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-screen overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Kommentare</DialogTitle>
        </DialogHeader>
        {comments && comments.length !== 0 ? (
          <>
            {comments.map((comment, idx) => (
              <Card key={idx} className="my-1 bg-gray-200 dark:bg-neutral-950">
                <CardHeader className="flex flex-col">
                  <div className="flex justify-between">
                    <CardTitle>
                      {comment.content}
                    </CardTitle>
                    {/* <p>{`${thread._count.posts} Einträge`}</p> */}
                  </div>
                  <div className="flex justify-between">
                    <CardDescription>
                      Erstellt am {comment.createdAt.toLocaleString()} von{" "}
                      {comment.user.name ?? "Unknown"}
                    </CardDescription>
                    <p className="text-sm text-muted-foreground">{`Zuletzt aktualisiert: ${comment.updatedAt.toLocaleString()}`}</p>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </>
        ) : (
          <p>Es wurden noch keine Kommentare geschrieben.</p>
        )}
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-start gap-3">
            <Label htmlFor="content" className="text-right">
              Kommentar schreiben
            </Label>
            <Textarea
              id="content"
              placeholder="Schreibe einen Kommentar.."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="col-span-3 md:min-h-[120px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            disabled={createComment.isPending}
            onClick={() =>
              createComment.mutate({
                content,
                postId,
              })
            }
          >
            {createComment.isPending ? "Wird erstellt..." : "Kommentar erstellen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}