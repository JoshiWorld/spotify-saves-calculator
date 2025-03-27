"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { type FC, useState } from "react";

interface CreateCommentProps {
  postId: string;
  replyToId?: string;
}

export const CreateComment: FC<CreateCommentProps> = ({
  postId,
  replyToId,
}) => {
  const utils = api.useUtils();
  const [input, setInput] = useState<string>("");
  const router = useRouter();

  const createComment = api.forum.comment.useMutation({
    onSuccess: async () => {
      await utils.forum.invalidate();
      router.refresh();
      setInput("");
    },
    onError: () => {
      return toast({
        title: "Etwas ist schiefgelaufen.",
        description:
          "Dein Kommentar wurde nicht veröffentlicht. Bitte versuche es erneut.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="comment">Jetzt kommentieren</Label>
      <div className="mt-2">
        <Textarea
          id="comment"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={1}
          placeholder="Schreibe einen Kommentar"
        />

        <div className="mt-2 flex justify-end">
          <Button
            disabled={input.length === 0 || createComment.isPending}
            onClick={() =>
              createComment.mutate({ postId, text: input, replyToId })
            }
          >
            Kommentar veröffentlichen
          </Button>
        </div>
      </div>
    </div>
  );
};
