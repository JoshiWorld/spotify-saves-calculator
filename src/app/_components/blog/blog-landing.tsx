"use client";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import FuzzySearch from "fuzzy-search";
import { Container } from "../landing/container";
import { api } from "@/trpc/react";
import { LoadingSkeleton } from "@/components/ui/loading";
import { type Blog } from "@prisma/client";

export function BlogWithSearch() {
  const { data: blogs, isLoading } = api.blog.getAll.useQuery();

  return (
    <div className="relative overflow-hidden">
      <Container className="flex flex-col items-center justify-between pb-20">
        <div className="relative z-20 py-10 md:pt-40">
          <h1 className="mt-4 text-xl font-bold tracking-tight text-black dark:text-white md:text-3xl lg:text-5xl">
            SmartSavvy Blog
          </h1>
        </div>

        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {blogs ? (
              <>
                {blogs.slice(0, 1).map((blog, index) => (
                  <BlogCard blog={blog} key={blog.title + index} />
                ))}
                <BlogPostRows blogs={blogs} />
              </>
            ) : (
              <p>Es konnte nichts gefunden werden</p>
            )}
          </>
        )}
      </Container>
    </div>
  );
}

export const BlogPostRows = ({ blogs }: { blogs: Blog[] }) => {
  const [search, setSearch] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, react-hooks/exhaustive-deps
  const searcher = new FuzzySearch(blogs, ["title", "description"], {
    caseSensitive: false,
  });

  const [results, setResults] = useState(blogs);
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const results = searcher.search(search);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    setResults(results);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);
  return (
    <div className="w-full py-20">
      <div className="mb-10 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-2xl font-bold text-neutral-800 dark:text-white">
          Mehr Beiträge
        </p>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Beiträge suchen"
          className="placeholder:neutral-700 w-full max-w-xl rounded-md border border-neutral-200 bg-white p-2 text-sm text-neutral-700 shadow-sm outline-none focus:border-neutral-200 focus:outline-none focus:ring-0 dark:border-transparent dark:bg-neutral-800 dark:text-neutral-200 dark:placeholder-neutral-400 sm:min-w-96"
        />
      </div>

      <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
        {results.length === 0 ? (
          <p className="p-4 text-center text-neutral-400">
            Kein Beitrag gefunden
          </p>
        ) : (
          results.map((blog, index) => (
            <BlogPostRow blog={blog} key={blog.slug + index} />
          ))
        )}
      </div>
    </div>
  );
};

export const BlogPostRow = ({ blog }: { blog: Blog }) => {
  return (
    <Link
      href={`/blog/${blog.slug}`}
      key={`${blog.slug}`}
      className="group/blog-row flex flex-col items-start justify-between py-4 md:flex-row md:items-center"
    >
      <div>
        <p className="text-lg font-medium text-neutral-600 transition duration-200 dark:text-neutral-300">
          {blog.title}
        </p>
        <p className="mt-2 max-w-xl text-sm text-neutral-500 transition duration-200 dark:text-neutral-300">
          {truncate(blog.description, 80)}
        </p>

        <div className="my-4 flex items-center gap-2">
          <p className="max-w-xl text-sm text-neutral-500 transition duration-200 dark:text-neutral-300">
            {format(new Date(blog.date), "MMMM dd, yyyy")}
          </p>
        </div>
      </div>
      <Image
        src={blog.authorAvatar}
        alt={blog.author}
        width={40}
        height={40}
        className="mt-4 h-6 w-6 rounded-full object-cover md:mt-0 md:h-10 md:w-10"
      />
    </Link>
  );
};

const Logo = () => {
  return (
    <Link
      href="/"
      className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-5 w-6 rounded-bl-sm rounded-br-lg rounded-tl-lg rounded-tr-sm bg-black dark:bg-white" />
      <span className="font-medium text-black dark:text-white">SmartSavvy</span>
    </Link>
  );
};

export const BlogCard = ({ blog }: { blog: Blog }) => {
  return (
    <Link
      className="group/blog grid w-full grid-cols-1 overflow-hidden rounded-3xl border border-transparent shadow-derek transition duration-200 hover:scale-[1.02] hover:border-neutral-200 hover:bg-neutral-100 dark:hover:border-neutral-800 dark:hover:bg-neutral-900 md:grid-cols-2"
      href={`/blog/${blog.slug}`}
    >
      <div className="">
        {blog.image ? (
          <BlurImage
            src={blog.image || ""}
            alt={blog.title}
            height={800}
            width={800}
            className="h-full max-h-96 w-full rounded-3xl object-cover object-top"
          />
        ) : (
          <div className="flex h-full items-center justify-center group-hover/blog:bg-neutral-100 dark:group-hover/blog:bg-neutral-900">
            <Logo />
          </div>
        )}
      </div>
      <div className="flex flex-col justify-between p-4 group-hover/blog:bg-neutral-100 dark:group-hover/blog:bg-neutral-900 md:p-8">
        <div>
          <p className="mb-4 text-lg font-bold text-neutral-800 dark:text-neutral-100 md:text-4xl">
            {blog.title}
          </p>
          <p className="mt-2 text-left text-base text-neutral-600 dark:text-neutral-400 md:text-xl">
            {truncate(blog.description, 500)}
          </p>
        </div>
        <div className="mt-6 flex items-center space-x-2">
          <Image
            src={blog.authorAvatar}
            alt={blog.author}
            width={20}
            height={20}
            className="h-5 w-5 rounded-full"
          />
          <p className="text-sm font-normal text-black dark:text-white">
            {blog.author}
          </p>
          <div className="h-1 w-1 rounded-full bg-neutral-300"></div>
          <p className="max-w-xl text-sm text-neutral-600 transition duration-200 dark:text-neutral-300">
            {format(new Date(blog.date), "MMMM dd, yyyy")}
          </p>
        </div>
      </div>
    </Link>
  );
};

interface IBlurImage {
  height: number;
  width: number;
  src: string;
  objectFit?: string | undefined;
  className?: string | null;
  alt?: string | undefined;
  layout?: string | undefined;
  [x: string]: unknown;
}

export const BlurImage = ({
  height,
  width,
  src,
  className,
  objectFit,
  alt,
  layout,
  ...rest
}: IBlurImage) => {
  const [isLoading, setLoading] = useState(true);
  return (
    <Image
      className={cn(
        "transition duration-300",
        isLoading ? "blur-sm" : "blur-0",
        className,
      )}
      onLoad={() => setLoading(false)}
      src={src}
      width={width}
      objectFit={objectFit}
      height={height}
      loading="lazy"
      decoding="async"
      blurDataURL={src}
      layout={layout}
      alt={alt ? alt : "Avatar"}
      {...rest}
    />
  );
};

export const truncate = (text: string, length: number) => {
  return text.length > length ? text.slice(0, length) + "..." : text;
};
