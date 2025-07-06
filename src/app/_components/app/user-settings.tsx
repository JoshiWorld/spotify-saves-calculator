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
import { LogOutIcon, UploadIcon } from "lucide-react";
import { IconBrandMeta } from "@tabler/icons-react";
import { useEffect, useRef } from "react";
import { LoadingSkeleton } from "@/components/ui/loading";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvatarIcon } from "@radix-ui/react-icons";

const formSchema = z.object({
  name: z.string().min(2).max(50),
  // image: z.string(),
  goodCPS: z.string(),
  midCPS: z.string(),
  email: z.string().email().optional(),
});

export function UserSettings() {
  const { toast } = useToast();
  const router = useRouter();
  const utils = api.useUtils();
  const { data: user, isLoading: isLoadingUser } =
    api.user.getSettings.useQuery();

  // const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateProfilePicture = api.user.updateProfilePicture.useMutation({
    onSuccess: async () => {
      await utils.user.invalidate();
      toast({
        variant: "default",
        title: "Dein Profilbild wurde geupdated"
      });
      router.refresh();
    }
  })

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
        description:
          "Du musst dein Abo kündigen, bevor du deinen Account löschen kannst.",
      });
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      // image: "",
      goodCPS: "",
      midCPS: "",
      email: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.setValue("name", user.name ?? "");
      // form.setValue("image", user.image ?? "");
      form.setValue("goodCPS", String(user.goodCPS));
      form.setValue("midCPS", String(user.midCPS));
      form.setValue("email", user.email ?? "");
    }
  }, [user, form]);

  if (isLoadingUser || !user) {
    return <LoadingSkeleton />;
  }

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateUser.mutate({
      name: values.name,
      // image: values.image,
      goodCPS: parseFloat(values.goodCPS),
      midCPS: parseFloat(values.midCPS),
    });
  };

  const metaButton = () => {
    if (user.metaAccessToken) {
      removeMetaAccess.mutate();
    } else {
      router.push("/api/meta/login");
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      console.warn("Keine Datei ausgewählt.");
      return;
    }

    // Validierung
    if (file.size > 5 * 1024 * 1024) {
      console.error("Datei ist zu groß (max. 5MB).");
      return;
    }

    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      console.error(
        "Ungültiges Dateiformat. Nur PNG, JPG und JPEG sind erlaubt.",
      );
      return;
    }

    // Dateidimensionen prüfen (asynchron)
    const img = new Image();
    img.onload = async () => {
      if (img.width !== img.height) {
        console.error("Das Bild muss ein 1:1 Format haben.");
        return;
      }

      // setSelectedFile(file); // Datei ist gültig
      // console.log("Datei ausgewählt:", file);

      const image = await uploadImage(file);

      if (!image) {
        alert(
          "Es gab einen Fehler mit deinem Profilbild. Wende dich an unseren Support.",
        );
        return;
      }

      updateProfilePicture.mutate({ image });
    };
    img.onerror = () => {
      console.error("Fehler beim Lesen der Bildabmessungen.");
    };
    img.src = URL.createObjectURL(file);
  };

  return (
    <Form {...form}>
      <div className="flex items-center justify-between gap-10">
        <LogOutIcon
          className="cursor-pointer text-red-500 transition hover:text-red-700"
          onClick={() => signOut()}
        />
        <div className="relative">
          <IconBrandMeta
            className="cursor-pointer text-blue-500 transition hover:text-blue-700"
            onClick={() => metaButton()}
          />
          {user.metaAccessToken ? (
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
        <div className="mt-5 flex items-center justify-between gap-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="grow">
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
          <div className="avatar-wrapper relative shrink-0">
            <Avatar>
              <AvatarImage src={user.image ?? ""} />
              <AvatarFallback>
                <AvatarIcon className="h-full w-full" />
              </AvatarFallback>
            </Avatar>
            <div className="avatar-overlay">
              <UploadIcon className="h-4 w-4" onClick={handleUploadClick} />
            </div>
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              className="hidden"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
          </div>
        </div>
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

async function uploadImage(file: File) {
  const fileToUpload = file;
  const fileType = fileToUpload.type;
  const filename = fileToUpload.name;

  const signedUrlResponse = await fetch(
    "/api/protected/s3/generateProfileImage",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filename,
        fileType,
      }),
    },
  );

  if (!signedUrlResponse.ok) {
    alert("Fehler beim Abrufen der signierten URL");
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { uploadUrl, key, imageUrl } = await signedUrlResponse.json();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": fileType,
    },
    body: fileToUpload,
  });

  if (!uploadResponse.ok) {
    alert("Fehler beim Hochladen des Bildes");
    return;
  }

  return `${imageUrl}${key}`;
}