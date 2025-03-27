"use client";

import {
  type VoteType,
} from "@prisma/client";
import { MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FC, useRef, useState } from "react";
import { useOnClickOutside } from "@/hooks/use-on-click-outside";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvatarIcon } from "@radix-ui/react-icons";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { api } from "@/trpc/react";

type Reply = {
  author: {
    name: string | null;
    image: string | null;
  };
  createdAt: Date;
  id: string;
  text: string;
  votes: {
    type: VoteType;
    user: {
      id: string;
    };
  }[];
};

type MinComment = {
  id: string;
  votes: {
    type: VoteType;
    user: {
      id: string;
    };
  }[];
  createdAt: Date;
  author: {
    name: string | null;
    image: string | null;
  };
  text: string;
  replyTo: {
    id: string;
  } | null;
  replies: Reply[];
};

type MinCommentVote = {
  type: VoteType;
  user: {
    id: string;
  };
};

interface PostCommentProps {
  comment: MinComment;
  votesAmt: number;
  currentVote: MinCommentVote | undefined;
  postId: string;
}

interface PostCommentReplyProps {
  comment: Reply;
  votesAmt: number;
  currentVote: MinCommentVote | undefined;
  postId: string;
}

export const PostComment: FC<PostCommentProps> = ({
  comment,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  votesAmt,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  currentVote,
  postId,
}) => {
  const utils = api.useUtils();
  const [isReplying, setIsReplying] = useState<boolean>(false);
  const commentRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState<string>(`@${comment.author.name} `);
  const router = useRouter();
  useOnClickOutside(commentRef, () => {
    setIsReplying(false);
  });

  const commentOnPost = api.forum.comment.useMutation({
    onSuccess: async () => {
      await utils.forum.invalidate();
      router.refresh();
      setIsReplying(false);
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
    <div ref={commentRef} className="flex flex-col">
      <div className="flex items-center">
        <Avatar>
          <AvatarImage src={comment.author.image ?? ""} />
          <AvatarFallback>
            <AvatarIcon className="h-full w-full" />
          </AvatarFallback>
        </Avatar>
        <div className="ml-2 flex items-center gap-x-2">
          <p className="text-sm font-medium text-white">
            {comment.author.name}
          </p>

          <p className="max-h-40 truncate text-xs text-zinc-500">
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
              locale: de,
            })}
          </p>
        </div>
      </div>

      <p className="mt-2 text-sm text-zinc-50">{comment.text}</p>

      <div className="flex items-center gap-2">
        {/* <CommentVotes
          commentId={comment.id}
          votesAmt={votesAmt}
          currentVote={currentVote}
        /> */}

        <Button
          onClick={() => {
            setIsReplying(true);
          }}
          variant="ghost"
          size="xs"
        >
          <MessageSquare className="mr-1.5 h-4 w-4" />
          Antworten
        </Button>
      </div>

      {isReplying ? (
        <div className="grid w-full gap-1.5">
          <Label htmlFor="comment">Deine Antwort</Label>
          <div className="mt-2">
            <Textarea
              onFocus={(e) =>
                e.currentTarget.setSelectionRange(
                  e.currentTarget.value.length,
                  e.currentTarget.value.length,
                )
              }
              autoFocus
              id="comment"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={1}
              placeholder="What are your thoughts?"
            />

            <div className="mt-2 flex justify-end gap-2">
              <Button
                tabIndex={-1}
                variant="subtle"
                onClick={() => setIsReplying(false)}
              >
                Abbrechen
              </Button>
              <Button
                disabled={commentOnPost.isPending}
                onClick={() => {
                  if (!input) return;
                  commentOnPost.mutate({
                    postId,
                    text: input,
                    replyToId: comment.replyTo?.id ?? comment.id,
                  });
                }}
              >
                Kommentieren
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export const PostCommentReply: FC<PostCommentReplyProps> = ({
  comment,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  votesAmt,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  currentVote,
  postId,
}) => {
  const utils = api.useUtils();
  const [isReplying, setIsReplying] = useState<boolean>(false);
  const commentRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState<string>(`@${comment.author.name} `);
  const router = useRouter();
  useOnClickOutside(commentRef, () => {
    setIsReplying(false);
  });

  const commentOnPost = api.forum.comment.useMutation({
    onSuccess: async () => {
      await utils.forum.invalidate();
      router.refresh();
      setIsReplying(false);
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
    <div ref={commentRef} className="flex flex-col">
      <div className="flex items-center">
        <Avatar>
          <AvatarImage src={comment.author.image ?? ""} />
          <AvatarFallback>
            <AvatarIcon className="h-full w-full" />
          </AvatarFallback>
        </Avatar>
        <div className="ml-2 flex items-center gap-x-2">
          <p className="text-sm font-medium text-white">
            {comment.author.name}
          </p>

          <p className="max-h-40 truncate text-xs text-zinc-500">
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
              locale: de,
            })}
          </p>
        </div>
      </div>

      <p className="mt-2 text-sm text-zinc-50">{comment.text}</p>

      <div className="flex items-center gap-2">
        {/* <CommentVotes
          commentId={comment.id}
          votesAmt={votesAmt}
          currentVote={currentVote}
        /> */}

        <Button
          onClick={() => {
            setIsReplying(true);
          }}
          variant="ghost"
          size="xs"
        >
          <MessageSquare className="mr-1.5 h-4 w-4" />
          Antworten
        </Button>
      </div>

      {isReplying ? (
        <div className="grid w-full gap-1.5">
          <Label htmlFor="comment">Deine Antwort</Label>
          <div className="mt-2">
            <Textarea
              onFocus={(e) =>
                e.currentTarget.setSelectionRange(
                  e.currentTarget.value.length,
                  e.currentTarget.value.length,
                )
              }
              autoFocus
              id="comment"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={1}
              placeholder="What are your thoughts?"
            />

            <div className="mt-2 flex justify-end gap-2">
              <Button
                tabIndex={-1}
                variant="subtle"
                onClick={() => setIsReplying(false)}
              >
                Abbrechen
              </Button>
              <Button
                disabled={commentOnPost.isPending}
                onClick={() => {
                  if (!input) return;
                  commentOnPost.mutate({
                    postId,
                    text: input,
                    replyToId: comment.id,
                  });
                }}
              >
                Kommentieren
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
