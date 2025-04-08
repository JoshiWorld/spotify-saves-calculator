"use client";

import { useToast } from "@/hooks/use-toast";
import { api } from "@/trpc/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function DeleteCourse({ id }: { id: string }) {
  const { toast } = useToast();
  const utils = api.useUtils();

  const deleteCourse = api.course.deleteCourse.useMutation({
    onSuccess: async () => {
      await utils.course.invalidate();
      toast({
        variant: "default",
        title: "Der Kurs wurde erfolgreich gelöscht.",
      });
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Löschen</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Willst du diesen Kurs wirklich löschen?</DialogTitle>
        </DialogHeader>
        <Button
          variant="destructive"
          onClick={() => deleteCourse.mutate({ id })}
        >
          Kurs löschen
        </Button>
      </DialogContent>
    </Dialog>
  );
}
