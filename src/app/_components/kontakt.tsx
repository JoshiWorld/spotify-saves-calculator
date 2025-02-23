"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import { useToast } from "@/hooks/use-toast";

const kontaktSchema = z.object({
  name: z.string().min(2, {
    message: "Bitte gib deinen Vornamen an.",
  }),
  surname: z.string().min(2, {
    message: "Bitte gib deinen Nachnamen an.",
  }),
  email: z
    .string()
    .min(2, {
      message: "Bitte gib deine E-Mail an.",
    })
    .email({
      message: "Bitte gib eine richtige E-Mail an.",
    }),
  content: z.string().min(50, {
    message: "Dein Anliegen muss mindestens 50 Zeichen enthalten.",
  }),
});

export function Kontakt() {
  return (
    <div className="z-10 mt-20 rounded-sm border border-white border-opacity-40 bg-opacity-95 p-5 shadow-xl transition dark:bg-zinc-950">
      <KontaktForm />
    </div>
  );
}

function KontaktForm() {
  const { toast } = useToast();
  const sendMail = api.kontakt.send.useMutation({
    onSuccess: () => {
      toast({
        variant: "default",
        title:
          "Wir haben Dein Anliegen erhalten. Du bekommst in Kürze eine Bestätigungsmail.",
      });
      form.clearErrors();
      form.reset();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title:
          "Es gab einen Fehler beim Kontaktformular. Bitte versuche es später erneut.",
      });
    },
  });

  const form = useForm<z.infer<typeof kontaktSchema>>({
    resolver: zodResolver(kontaktSchema),
    defaultValues: {
      name: "",
      surname: "",
      email: "",
      content: "",
    },
  });

  function onSubmit(values: z.infer<typeof kontaktSchema>) {
    const { name, surname, email, content } = values;
    const formattedContent = content.replace(/\n/g, "<br>");
    sendMail.mutate({
      name,
      surname,
      email,
      content: formattedContent,
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl items-center justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-32">
      <div className="mx-auto w-full max-w-md">
        <div>
          <h2 className="text-2xl font-bold leading-9 tracking-tight text-black dark:text-white">
            Kontaktformular
          </h2>
        </div>

        <div className="mt-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="flex gap-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vorname</FormLabel>
                      <FormControl>
                        <Input placeholder="Max" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="surname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nachname</FormLabel>
                      <FormControl>
                        <Input placeholder="Mustermann" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-Mail</FormLabel>
                    <FormControl>
                      <Input placeholder="max.mustermann@web.de" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anliegen</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Beschreibe dein Anliegen.."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-center">
                <Button type="submit" disabled={sendMail.isPending}>{sendMail.isPending ? "Wird gesendet.." : "Senden"}</Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
