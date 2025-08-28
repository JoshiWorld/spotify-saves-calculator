import { EditorOutput } from "@/app/_components/forum/editor-output";
import { CommentsSection } from "@/app/_components/forum/post/comment-section";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/trpc/server";
import { AvatarIcon } from "@radix-ui/react-icons";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { Suspense } from "react";

type Props = {
  id: string;
};

type PageProps = {
  params: Promise<Props>;
};

export default async function ForumPostPage({ params }: PageProps) {
  const { id } = await params;
  const post = await api.forum.getPost({ postId: id });

  if (!post) return <p>Beitrag existiert nicht.</p>;

  return (
    <div className="w-full flex-1">
      <h1 className="py-2 text-3xl font-semibold leading-6">{post.title}</h1>
      <EditorOutput content={post?.content} />
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Erstellt{" "}
          {formatDistanceToNow(new Date(post.createdAt), {
            addSuffix: true,
            locale: de,
          })}
        </p>
        <div className="flex items-center justify-end gap-2">
          <p>Erstellt von {post.author.name}</p>
          <Avatar>
            <AvatarImage src={post.author.image ?? ""} />
            <AvatarFallback>
              <AvatarIcon className="h-full w-full" />
              {/* {post.author.name?.slice(0, 2).toUpperCase()} */}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <Suspense>
        <CommentsSection postId={post.id} />
      </Suspense>
    </div>
  );
}
