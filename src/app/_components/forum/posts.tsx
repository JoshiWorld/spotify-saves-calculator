"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/ui/loading";
import { api } from "@/trpc/react";
import { VoteType } from "@prisma/client";
import { AvatarIcon } from "@radix-ui/react-icons";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type MinPost = {
  id: string;
  votes: {
    type: VoteType;
    user: {
      id: string;
    };
  }[];
  _count: {
    comments: number;
  };
  createdAt: Date;
  title: string;
  author: {
    name: string | null;
    image: string | null;
  };
};

export function ForumPosts() {
  const router = useRouter();
  const utils = api.useUtils();
  const votePost = api.forum.votePost.useMutation({
    onSuccess: async () => {
      await utils.forum.getPosts.invalidate();
    },
  });

  const [page, setPage] = useState<number>(1);

  const { data: postsData, isLoading: isLoadingInitialPosts } =
    api.forum.getPosts.useQuery({ page });
  const { data: user, isLoading: isLoadingUser } = api.user.get.useQuery();

  const [posts, setPosts] = useState<MinPost[]>([]);
  const hasNextPage = postsData?.hasNextPage ?? false;

  useEffect(() => {
    if (postsData) {
      setPosts((prev) => [...prev, ...postsData.items]);
    }
  }, [postsData]);

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  const isLoading = isLoadingInitialPosts || isLoadingUser;

  if (isLoading || !user) {
    return <LoadingSkeleton />;
  }

  if (!posts) {
    return <div>Es konnten keine Posts geladen werden.</div>;
  }

  const handleVote = (voteType: VoteType, postId: string) => {
    votePost.mutate({ postId, voteType });
  }

  return (
    <div className="flex flex-col justify-center">
      {posts.map((post) => {
        const vote = post.votes.find((vote) => vote.user.id === user.id);

        return (
          <div
            key={post.id}
            className="my-5 flex items-start justify-center gap-3"
          >
            <div className="flex flex-col items-end justify-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote(VoteType.UP, post.id)}
              >
                <ThumbsUpIcon
                  className={`h-4 w-4 ${vote?.type === VoteType.UP ? "fill-white" : ""}`}
                />
              </Button>
              <p className="pr-3 text-zinc-500">{getVotesResult(post)}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote(VoteType.DOWN, post.id)}
              >
                <ThumbsDownIcon
                  className={`h-4 w-4 ${vote?.type === VoteType.DOWN ? "fill-white" : ""}`}
                />
              </Button>
            </div>
            <Card className="w-[500px]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{post.title}</CardTitle>
                    <CardDescription>
                      Erstellt von {post.author.name}
                    </CardDescription>
                  </div>
                  <Avatar>
                    <AvatarImage src={post.author.image ?? ""} />
                    <AvatarFallback>
                      <AvatarIcon className="h-full w-full" />
                      {/* {post.author.name?.slice(0, 2).toUpperCase()} */}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Erstellt{" "}
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                      locale: de,
                    })}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/app/forum/post/${post.id}`)}
                  >
                    Beitrag ansehen
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}
      {hasNextPage ? (
        <Button variant="ghost" className="my-5" onClick={loadMore}>
          Mehr Beiträge laden..
        </Button>
      ) : (
        <div className="my-5 text-zinc-300 text-center">Keine weiteren Beiträge vorhanden</div>
      )}
    </div>
  );
}

type Votes = {
  type: VoteType;
};

function getVotesResult({ votes }: { votes: Votes[] }) {
  const upvotes = votes.filter((vote) => vote.type === VoteType.UP).length;
  const downvotes = votes.filter((vote) => vote.type === VoteType.DOWN).length;
  return upvotes - downvotes;
}
