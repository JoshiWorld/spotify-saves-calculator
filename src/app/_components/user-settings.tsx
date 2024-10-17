/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import { api } from "@/trpc/react";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2).max(50),
  image: z.string().min(2),
  goodCPS: z.string(),
  midCPS: z.string(),
});

export function UserSettings() {
  const { toast } = useToast();
  const router = useRouter();
  const utils = api.useUtils();
  const [user] = api.user.get.useSuspenseQuery();

  const updateUser = api.user.update.useMutation({
    onSuccess: async () => {
      await utils.user.invalidate();
      toast({
        description: "Deine Einstellungen wurden gespeichert.",
      });
    },
  });

  const deleteUser = api.user.delete.useMutation({
    onSuccess: () => {
      router.push("/");
      window.location.reload();
      toast({
        description: "Dein Account wurde gelöscht.",
      });
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const form = useForm<z.infer<typeof formSchema>>({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    resolver: zodResolver(formSchema),
    defaultValues: {
      // @ts-expect-error || cannot be undefined
      name: user!.name,
      // @ts-expect-error || cannot be undefined
      image: user!.image,
      goodCPS: String(user!.goodCPS),
      midCPS: String(user!.midCPS),
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateUser.mutate({
      name: values.name,
      image: values.image,
      goodCPS: parseFloat(values.goodCPS),
      midCPS: parseFloat(values.midCPS),
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Max Mustermann" {...field} />
              </FormControl>
              <FormDescription>
                Dieser Name wird oben angezeigt.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profilbild</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Link zu Bild" {...field} />
              </FormControl>
              <FormDescription>Dein Profilbild.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="goodCPS"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Good-CPS</FormLabel>
              <FormControl>
                <Input type="number" placeholder="GoodCPS" {...field} />
              </FormControl>
              <FormDescription>
                Alles was unter diesem Wert ist, wird als grün gekennzeichnet
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="midCPS"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mid-CPS</FormLabel>
              <FormControl>
                <Input type="number" placeholder="MidCPS" {...field} />
              </FormControl>
              <FormDescription>
                Alles was unter diesem Wert ist, wird als gelb gekennzeichnet.
                Alles ab diesem Wert und darüber wird als Rot gekennzeichnet
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          disabled={deleteUser.isPending}
          type="button"
          variant={"destructive"}
          onClick={() => deleteUser.mutate()}
        >
          {deleteUser.isPending ? "Wird gelöscht.." : "Account löschen"}
        </Button>
        <Button type="submit" disabled={updateUser.isPending} className="ml-6">
          {updateUser.isPending ? "Wird gespeichert.." : "Speichern"}
        </Button>
      </form>
    </Form>
  );
}
