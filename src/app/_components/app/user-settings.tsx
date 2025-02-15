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
import { signOut } from "next-auth/react";
import { LogOutIcon } from "lucide-react";
import { IconBrandMeta } from "@tabler/icons-react";

const formSchema = z.object({
  name: z.string().min(2).max(50),
  // image: z.string().min(2),
  goodCPS: z.string(),
  midCPS: z.string(),
  email: z.string().email().optional(),
});

export function UserSettings() {
  const { toast } = useToast();
  const router = useRouter();
  const utils = api.useUtils();
  const [user] = api.user.getSettings.useSuspenseQuery();

  const removeMetaAccess = api.user.removeMetaAccess.useMutation({
    onSuccess: async () => {
      await utils.user.invalidate();
      toast({
        variant: "default",
        title: "Dein Meta-Zugriff wurde entfernt.",
      });
      router.refresh();
    },
  });

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
    onError: () => {
      toast({
        description: "Du musst dein Abo kündigen, bevor du deinen Account löschen kannst.",
      });
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const form = useForm<z.infer<typeof formSchema>>({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    resolver: zodResolver(formSchema),
    defaultValues: {
      // @ts-expect-error || cannot be undefined
      name: user!.name,
      // image: user!.image,
      goodCPS: String(user!.goodCPS),
      midCPS: String(user!.midCPS),
      email: user!.email!
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateUser.mutate({
      name: values.name,
      // image: values.image,
      goodCPS: parseFloat(values.goodCPS),
      midCPS: parseFloat(values.midCPS),
    });
  }

  function metaButton() {
    if(user!.metaAccessToken) {
      removeMetaAccess.mutate();
    } else {
      router.push("/api/meta/login");
    }
  }

  return (
    <Form {...form}>
      <div className="flex items-center justify-between gap-10">
        <LogOutIcon
          className="cursor-pointer text-red-500 transition hover:text-red-700"
          onClick={() => signOut()}
        />
        <div className="relative">
          <IconBrandMeta className="cursor-pointer text-blue-500 transition hover:text-blue-700" onClick={() => metaButton()} />
          {user!.metaAccessToken ? (
            <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">
              ✓
            </span>
          ) : (
            <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              ✕
            </span>
          )}
        </div>
      </div>
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
                Dieser Name wird im Forum angezeigt
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          disabled
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-Mail</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="max.mustermann@email.de"
                  {...field}
                />
              </FormControl>
              <FormDescription>Deine E-Mail für den Login</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-between gap-5">
          <FormField
            control={form.control}
            name="goodCPS"
            render={({ field }) => (
              <FormItem className="flex-1">
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
              <FormItem className="flex-1">
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
        </div>
        <div className="flex justify-center gap-5">
          <Button
            disabled={deleteUser.isPending}
            className="flex-1"
            type="button"
            variant={"destructive"}
            // onClick={() => deleteUser.mutate()}
            onClick={() => console.log("Account löschen")}
          >
            {deleteUser.isPending ? "Wird gelöscht.." : "Account löschen"}
          </Button>
          <Button
            type="submit"
            disabled={updateUser.isPending}
            className="flex-1"
          >
            {updateUser.isPending ? "Wird gespeichert.." : "Speichern"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
