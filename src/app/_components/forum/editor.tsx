"use client";

import type EditorJS from "@editorjs/editorjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import TextareaAutosize from "react-textarea-autosize";
import { type z } from "zod";

import { toast } from "@/hooks/use-toast";
import { uploadFiles } from "@/lib/uploadthing";
import { type PostCreationRequest, PostValidator } from "@/lib/validators/post";

import "@/styles/editor.css";
import { api } from "@/trpc/react";

type FormData = z.infer<typeof PostValidator>;

export const Editor: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(PostValidator),
    defaultValues: {
      title: "",
      content: null,
    },
  });
  const ref = useRef<EditorJS>();
  const _titleRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const utils = api.useUtils();

  const createPost = api.forum.createPost.useMutation({
    onSuccess: async () => {
      await utils.forum.getPosts.invalidate();
      router.push('/app/forum');

      router.refresh();

      return toast({
        description: "Dein Beitrag wurde veröffentlicht.",
      });      
    },
    onError: () => {
      return toast({
        title: "Etwas ist schiefgelaufen.",
        description:
          "Dein Beitrag wurde nicht veröffentlicht. Bitte versuche es erneut.",
        variant: "destructive",
      });
    }
  });

  const initializeEditor = useCallback(async () => {
    const EditorJS = (await import("@editorjs/editorjs")).default;
    const Header = (await import("@editorjs/header")).default as unknown;
    // @ts-expect-error || @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const Embed = (await import("@editorjs/embed")).default;
    const Table = (await import("@editorjs/table")).default;
    const List = (await import("@editorjs/list")).default;
    const Code = (await import("@editorjs/code")).default;
    // @ts-expect-error || @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const LinkTool = (await import("@editorjs/link")).default;
    const InlineCode = (await import("@editorjs/inline-code")).default;
    const ImageTool = (await import("@editorjs/image")).default;

    if (!ref.current) {
      const editor = new EditorJS({
        holder: "editor",
        onReady() {
          ref.current = editor;
        },
        placeholder: "Schreibe etwas in deinen Beitrag rein.",
        inlineToolbar: true,
        data: { blocks: [] },
        tools: {
          // @ts-expect-error || @ts-ignore
          header: Header,
          linkTool: {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            class: LinkTool,
            config: {
              endpoint: "/api/link",
            },
          },
          image: {
            class: ImageTool,
            config: {
              uploader: {
                async uploadByFile(file: File) {
                  if (!(file instanceof File)) {
                    console.error("file ist kein gültiges File-Objekt:", file);
                    return {
                      success: 0,
                      error: { message: "Ungültiges File-Objekt" },
                    };
                  }

                  // upload to uploadthing
                  try {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    const [res] = await uploadFiles("imageUploader", { files: [file] });

                    return {
                      success: 1,
                      file: {
                        // @ts-expect-error || @ts-ignore
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                        url: res.ufsUrl,
                      },
                    };
                  } catch (error: unknown) {
                    console.error("Fehler beim Hochladen der Datei:", error);
                    // @ts-expect-error || @ts-ignore
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    return { success: 0, error: { message: error.message } };
                  }
                },
              },
            },
          },
          list: List,
          code: Code,
          inlineCode: InlineCode,
          table: Table,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          embed: Embed,
        },
      });
    }
  }, []);

  useEffect(() => {
    if (Object.keys(errors).length) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for (const [_key, value] of Object.entries(errors)) {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        value;
        toast({
          title: "Etwas ist schiefgelaufen.",
          description: (value as { message: string }).message,
          variant: "destructive",
        });
      }
    }
  }, [errors]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMounted(true);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await initializeEditor();

      setTimeout(() => {
        _titleRef?.current?.focus();
      }, 0);
    };

    if (isMounted) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      init();

      return () => {
        ref.current?.destroy();
        ref.current = undefined;
      };
    }
  }, [isMounted, initializeEditor]);

  async function onSubmit(data: FormData) {
    const blocks = await ref.current?.save();

    const payload: PostCreationRequest = {
      title: data.title,
      content: blocks,
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    createPost.mutate({ title: payload.title, content: payload.content });
  }

  if (!isMounted) {
    return null;
  }

  const { ref: titleRef, ...rest } = register("title");

  return (
    <div className="w-full rounded-lg border border-zinc-200 dark:bg-zinc-900 bg-zinc-50 p-4">
      <form
        id="post-form"
        className="w-fit"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="prose prose-stone dark:prose-invert">
          <TextareaAutosize
            ref={(e) => {
              titleRef(e);
              // @ts-expect-error || @ts-ignore
              _titleRef.current = e;
            }}
            {...rest}
            placeholder="Titel"
            className="w-full resize-none appearance-none overflow-hidden bg-transparent text-5xl font-bold focus:outline-none"
          />
          <div id="editor" className="min-h-[500px]" />
          <p className="text-sm text-gray-500">
            Benutze{" "}
            <kbd className="rounded-md border bg-muted px-1 text-xs uppercase">
              TAB
            </kbd>{" "}
            für das Menü.
          </p>
        </div>
      </form>
    </div>
  );
};
