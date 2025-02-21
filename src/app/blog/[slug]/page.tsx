import { BlogContentCentered } from "@/app/_components/blog/blog-slug";
import { api } from "@/trpc/server";

export default async function BlogSlug({
  params,
}: {
  params: { slug: string };
}) {
  const slug = params.slug;
  await api.blog.get.prefetch({slug});

  return (
    <div>
      <BlogContentCentered slug={slug} />
    </div>
  );
}
