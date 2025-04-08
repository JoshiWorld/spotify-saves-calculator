"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/trpc/react";
import { useState } from "react";

export function CreateSection({ courseId }: { courseId: string }) {
  const { toast } = useToast();
  const utils = api.useUtils();
  const [title, setTitle] = useState<string>("");

  const createSection = api.course.createSection.useMutation({
    onSuccess: async () => {
      await utils.course.invalidate();
      toast({
        variant: "default",
        title: "Die Section wurde erstellt",
        description: `Titel: ${title}`,
      });
      setTitle("");
    },
  });

  const onSubmit = async () => {
    createSection.mutate({ title, courseId });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex justify-center">
          <Button variant="default" className="mt-2">
            Section hinzufügen
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Section hinzufügen</DialogTitle>
          <DialogDescription>
            Hier kannst du eine neue Section zum Kurs hinzufügen
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Titel
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="submit"
              disabled={createSection.isPending}
              onClick={onSubmit}
            >
              {createSection.isPending ? "Wird hinzugefügt..." : "Hinzufügen"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}