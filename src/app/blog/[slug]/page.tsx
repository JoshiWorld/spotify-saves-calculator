import { BlogContentCentered } from "@/app/_components/blog/blog-slug";
import { api } from "@/trpc/server";

type Props = {
  slug: string;
};

type PageProps = {
  params: Promise<Props>;
};

export default async function BlogSlug({ params }: PageProps) {
  const { slug } = await params;
  await api.blog.get.prefetch({ slug });

  return (
    <div>
      <BlogContentCentered slug={slug} />
    </div>
  );
}
