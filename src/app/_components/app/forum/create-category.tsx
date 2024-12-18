"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/trpc/react";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { IconPencil } from "@tabler/icons-react";

export function CreateCategory({ open }: { open: boolean }) {
  const { toast } = useToast();
  const utils = api.useUtils();
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const createCategory = api.forum.createCategory.useMutation({
    onSuccess: async () => {
      await utils.forum.getCategories.invalidate();
      toast({
        variant: "default",
        title: "Die Kategorie wurde erstellt",
        description: `Name: ${name}`,
      });
      setName("");
      setDescription("");
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="default"
          //   onClick={() => setTab(category.id)}
          className={cn(
            "group/sidebar flex items-center justify-center gap-2 rounded-sm px-2 py-2",
          )}
        >
          <IconPencil className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
          <motion.span
            animate={{
              display: open ? "inline-block" : "none",
              opacity: open ? 1 : 0,
            }}
            className="!m-0 inline-block whitespace-pre !p-0 text-sm text-neutral-700 transition duration-150 dark:text-neutral-200"
          >
            Kategorie erstellen
          </motion.span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Kategorie erstellen</DialogTitle>
          <DialogDescription>
            Hier kannst du eine Kategorie erstellen
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name*
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Beschreibung
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="submit"
              disabled={createCategory.isPending}
              onClick={() => createCategory.mutate({ name, description })}
            >
              {createCategory.isPending ? "Wird erstellt..." : "Erstellen"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
