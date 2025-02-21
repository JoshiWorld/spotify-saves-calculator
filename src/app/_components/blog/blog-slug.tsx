"use client";

import { api } from "@/trpc/react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import Image from "next/image";
import React from "react";
import ReactMarkdown from "react-markdown";
import { LoadingSkeleton } from "@/components/ui/loading";

export function BlogContentCentered({ slug }: { slug: string }) {
  const { data: blog, isLoading } = api.blog.get.useQuery({ slug });

  if(isLoading) return <LoadingSkeleton />;
  if(!blog) return <p>Beitrag konnte nicht gefunden werden.</p>

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-20 md:pt-40 md:px-8">
      {blog.image && (
        <Image
          src={blog.image}
          alt={blog.title}
          className="h-60 w-full rounded-3xl object-cover md:h-[30rem]"
          height={720}
          width={1024}
        />
      )}
      <h2 className="mb-2 mt-6 text-2xl font-bold tracking-tight text-black dark:text-white">
        {blog.title}
      </h2>
      <div className="flex items-center">
        <Image
          src={blog.authorAvatar}
          alt={blog.author}
          className="h-5 w-5 rounded-full"
          height={20}
          width={20}
        />
        <p className="pl-2 text-sm text-neutral-600 dark:text-neutral-400">
          {blog.author}
        </p>
        <div className="mx-2 h-1 w-1 rounded-full bg-neutral-200 dark:bg-neutral-700" />
        <p className="pl-1 text-sm text-neutral-600 dark:text-neutral-400">
          {format(new Date(blog.date), 'dd. MMMM yyyy', { locale: de })}
        </p>
      </div>
      <div className="prose prose-base dark:prose-invert mt-10 sm:mt-16">
        <ReactMarkdown>{blog.description}</ReactMarkdown>
      </div>
    </div>
  );
}