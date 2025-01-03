"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/trpc/react";
import { BugType } from "@prisma/client";
import { useState } from "react";

export function CreateBug({ type }: { type: BugType }) {
  const { toast } = useToast();
  const utils = api.useUtils();
  const [message, setMessage] = useState<string>("");
  const [screenshot, setScreenshot] = useState<File | null>(null);

  const createBug = api.bug.create.useMutation({
    onSuccess: async () => {
      await utils.bug.getAll.invalidate();
      toast({
        variant: "default",
        title: "Deine Anfrage wurde erfolgreich gesendet!",
      });
      setMessage("");
      setScreenshot(null);
    },
  });

  const submit = async () => {
    if (!screenshot) {
      return createBug.mutate({ message, type });
    }

    const fileType = screenshot.type;
    const filename = screenshot.name;

    const signedUrlResponse = await fetch(
      "/api/protected/s3/generateScreenshotUrl",
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
      body: screenshot,
    });

    if (!uploadResponse.ok) {
      alert("Fehler beim Hochladen des Screenshots");
      return;
    }

    const image = `${imageUrl}${key}`;

    return createBug.mutate({ message, type, screenshot: image });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="mt-2">
          {type === BugType.BUG ? "Bug melden" : "Feature anfragen"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] max-w-[350px] overflow-y-auto md:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            {type === BugType.BUG ? "Bug melden" : "Feature anfragen"}
          </DialogTitle>
          <DialogDescription>
            Hier kannst du eine Anfrage senden
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="message" className="text-right">
              Beschreibung*
            </Label>
            <Textarea
              placeholder="Beschreibe deine Anfrage.."
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image" className="text-right">
              Anhang (Screenshot)
            </Label>
            <Input
              id="image"
              type="file"
              accept=".jpg, .jpeg, .png"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setScreenshot(e.target.files[0] ?? null);
                }
              }}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="submit"
              disabled={createBug.isPending}
              onClick={submit}
            >
              {createBug.isPending ? "Wird gesendet..." : "Senden"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}