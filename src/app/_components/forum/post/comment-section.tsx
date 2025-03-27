"use client";

import { api } from "@/trpc/react";
import { PostComment, PostCommentReply } from "./comment";
import { CreateComment } from "./create-comment";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const CommentsSection = ({ postId }: { postId: string }) => {
  const [replyCommentId, setReplyCommentId] = useState<string | null>(null);
  const { data: comments, isLoading: isLoadingComments } =
    api.forum.getTopLevelComments.useQuery({ postId });
  const { data: replies } = api.forum.getReplies.useQuery(
    {
      replyToId: replyCommentId,
    },
    {
      enabled: !!replyCommentId,
    },
  );
  const { data: user, isLoading: isLoadingUser } = api.user.get.useQuery();

  const loadMoreReplies = async (commentId: string) => {
    setReplyCommentId(commentId);
  };

  if (isLoadingComments || !comments || !user || isLoadingUser)
    return <p>Kommentare werden geladen</p>;

  return (
    <div className="mt-4 flex flex-col gap-y-4">
      <hr className="my-6 h-px w-full" />

      <CreateComment postId={postId} />

      <div className="mt-4 flex flex-col gap-y-6">
        {comments
          .filter((comment) => !comment.replyTo?.id)
          .map((topLevelComment) => {
            const topLevelCommentVotesAmt = topLevelComment.votes.reduce(
              (acc, vote) => {
                if (vote.type === "UP") return acc + 1;
                if (vote.type === "DOWN") return acc - 1;
                return acc;
              },
              0,
            );

            const topLevelCommentVote = topLevelComment.votes.find(
              (vote) => vote.user.id === user.id,
            );

            return (
              <div key={topLevelComment.id} className="flex flex-col">
                <div className="mb-2">
                  <PostComment
                    comment={topLevelComment}
                    currentVote={topLevelCommentVote}
                    votesAmt={topLevelCommentVotesAmt}
                    postId={postId}
                  />
                </div>

                {/* Render replies */}
                {topLevelComment.replies
                  .sort((a, b) => b.votes.length - a.votes.length) // Sort replies by most liked
                  .map((reply) => {
                    const replyVotesAmt = reply.votes.reduce((acc, vote) => {
                      if (vote.type === "UP") return acc + 1;
                      if (vote.type === "DOWN") return acc - 1;
                      return acc;
                    }, 0);

                    const replyVote = reply.votes.find(
                      (vote) => vote.user.id === user.id,
                    );

                    const additionalReplies =
                      (reply.id === replyCommentId && replies) ? replies : [];

                    return (
                      <div
                        key={reply.id}
                        className="ml-2 border-l-2 border-zinc-200 py-2 pl-4"
                      >
                        <PostCommentReply
                          comment={reply}
                          currentVote={replyVote}
                          votesAmt={replyVotesAmt}
                          postId={postId}
                        />
                        {additionalReplies.map((additionalReply) => (
                          <div
                            key={additionalReply.id}
                            className="ml-2 border-l-2 border-zinc-200 py-2 pl-4"
                          >
                            <PostCommentReply
                              comment={additionalReply}
                              currentVote={replyVote}
                              votesAmt={replyVotesAmt}
                              postId={postId}
                            />
                          </div>
                        ))}
                        {additionalReplies.length === 0 && reply._count.replies && (
                          <Button
                            variant="link"
                            onClick={() => loadMoreReplies(reply.id)}
                          >
                            Mehr Antworten laden
                          </Button>
                        )}
                      </div>
                    );
                  })}
              </div>
            );
          })}
      </div>
    </div>
  );
};
