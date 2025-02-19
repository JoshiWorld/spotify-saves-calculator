"use client";

import { api } from "@/trpc/react";
import { format } from "date-fns";
import Image from "next/image";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";

export function BlogContentCentered({ slug }: { slug: string }) {
  const { data: blog, isLoading } = api.blog.get.useQuery({ slug });

  if(isLoading) return <p>Loading..</p>;
  if(!blog) return <p>Beitrag konnte nicht gefunden werden.</p>

  return (
    <div className="mx-auto w-full max-w-3xl px-4 md:px-8">
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
          {format(new Date(blog.date), "LLLL d, yyyy")}
        </p>
      </div>
      <div className="prose prose-sm dark:prose-invert mt-10 sm:mt-16">
        <ReactMarkdown
          remarkPlugins={[remarkParse, remarkRehype, rehypeRaw, remarkGfm]}
          components={{
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            h1: ({ node, ...props }) => (
              <h1 className="text-2xl font-bold" {...props} />
            ),
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            h2: ({ node, ...props }) => (
              <h2 className="text-xl font-semibold" {...props} />
            ),
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            h3: ({ node, ...props }) => (
              <h3 className="text-lg font-medium" {...props} />
            ),
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            li: ({ node, ...props }) => (
              <li className="ml-6 list-disc" {...props} />
            ),
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            blockquote: ({ node, ...props }) => (
              <blockquote
                className="border-l-4 border-gray-300 pl-4 italic"
                {...props}
              />
            ),
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            a: ({ node, ...props }) => (
              <a className="text-blue-500 hover:underline" {...props} />
            ),
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            p: ({ node, ...props }) => <p className="mb-4" {...props} />,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            img: ({ node, ...props }) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="max-w-full"
                {...props}
                alt="8798asfzgasf789gaszigfuzbi"
              />
            ),
          }}
        >
          {dummyContentMarkdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}

const dummyContentMarkdown = `
## Introduction

Artificial Intelligence (AI) has been rapidly evolving, transforming various aspects of our lives. From voice assistants to autonomous vehicles, AI is becoming increasingly integrated into our daily routines.

### Key Areas of AI Development

1.  **Machine Learning**

    -   Deep Learning
    -   Neural Networks
    -   Reinforcement Learning

2.  **Natural Language Processing**

    -   Language Translation
    -   Sentiment Analysis
    -   Chatbots and Virtual Assistants

3.  **Computer Vision**

    -   Image Recognition
    -   Facial Recognition
    -   Autonomous Vehicles

## Ethical Considerations

As AI continues to advance, it's crucial to address ethical concerns:

-   Privacy and data protection
-   Bias in AI algorithms
-   Job displacement due to automation

## Conclusion

The future of AI is both exciting and challenging. As we continue to push the boundaries of what's possible, it's essential to balance innovation with responsible development and implementation.

> "The development of full artificial intelligence could spell the end of the human race." - Stephen Hawking

*This quote reminds us of the importance of careful consideration in AI advancement.*

![AI Concept Image](https://images.unsplash.com/photo-1719716136369-59ecf938a911?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)

For more information, visit [AI Research Center](https://example.com/ai-research).
`;
