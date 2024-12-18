"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import {
  type Genre,
} from "@prisma/client";
import { FileEditIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconTrash } from "@tabler/icons-react";

export function Genre() {
  const [genres] = api.genre.getAll.useSuspenseQuery();

  return (
    <div className="flex w-full flex-col">
      {genres.length !== 0 ? (
        <GenresTable genres={genres} />
      ) : (
        <p>Es wurde noch kein Genre angelegt</p>
      )}
      <CreateGenre />
    </div>
  );
}

function CreateGenre() {
  const { toast } = useToast();
  const utils = api.useUtils();
  const [name, setName] = useState<string>("");

  const createGenre = api.genre.create.useMutation({
    onSuccess: async () => {
      await utils.genre.invalidate();
      toast({
        variant: "default",
        title: "Das Genre wurde erstellt",
        description: `Name: ${name}`,
      });
      setName("");
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="mt-2">
          Hinzufügen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Genre hinzufügen</DialogTitle>
          <DialogDescription>
            Hier kannst du ein Genre hinzufügen
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="submit"
              disabled={createGenre.isPending}
              onClick={() =>
                createGenre.mutate({
                  name,
                })
              }
            >
              {createGenre.isPending ? "Wird hinzugefügt..." : "Hinzufügen"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function GenresTable({ genres }: { genres: Genre[] }) {
  const utils = api.useUtils();
  const { toast } = useToast();
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null);

  const deleteGenre = api.genre.delete.useMutation({
    onSuccess: async () => {
      await utils.product.invalidate();
      toast({
        variant: "destructive",
        title: "Das Genre wurde erfolgreich gelöscht",
      });
    },
  });

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="text-center">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {genres.map((genre, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{genre.name}</TableCell>
              <TableCell className="flex items-center justify-between">
                <FileEditIcon
                  className="text-white transition-colors hover:cursor-pointer hover:text-yellow-500"
                  onClick={() => setEditingGenre(genre)}
                />
                <IconTrash
                  className="text-white transition-colors hover:cursor-pointer hover:text-red-500"
                  onClick={() => deleteGenre.mutate({ id: genre.id })}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingGenre && (
        <EditGenre
          genre={editingGenre}
          onClose={() => setEditingGenre(null)}
        />
      )}
    </div>
  );
}

function EditGenre({
  genre,
  onClose,
}: {
  genre: Genre;
  onClose: () => void;
}) {
  const utils = api.useUtils();
  const { toast } = useToast();
  const [name, setName] = useState<string>(genre.name);

  const updateGenre = api.genre.update.useMutation({
    onSuccess: async () => {
      await utils.genre.invalidate();
      toast({
        variant: "default",
        title: "Das Genre wurde erfolgreich gespeichert",
      });
      onClose();
    },
  });

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Genre bearbeiten</SheetTitle>
          <SheetDescription>
            Hier kannst du Änderungen an einem Genre vornehmen
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button
              type="submit"
              disabled={updateGenre.isPending}
              onClick={() =>
                updateGenre.mutate({
                  id: genre.id,
                  name,
                })
              }
            >
              {updateGenre.isPending ? "Wird gespeichert..." : "Speichern"}
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
