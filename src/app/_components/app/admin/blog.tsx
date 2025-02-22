"use client";

import { useEffect, useState } from "react";
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
import { FileEditIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { IconTrash } from "@tabler/icons-react";
import { type Blog } from "@prisma/client";
import dynamic from "next/dynamic";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
});

export function AdminBlogs() {
  const { data, isLoading, error } = api.blog.getAll.useQuery();

  if (isLoading) return <p>Loading Blogs..</p>;
  if (!data) {
    console.log(error);
    return <p>Error loading Blogs. Watch console</p>;
  }

  return (
    <div className="flex w-full flex-col">
      {data.length !== 0 ? (
        <BlogsTable items={data} />
      ) : (
        <p>Es gibt noch keine Blogeinträge.</p>
      )}
      <CreateBlog />
    </div>
  );
}

function CreateBlog() {
  const { toast } = useToast();
  const utils = api.useUtils();

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  const createBlog = api.blog.create.useMutation({
    onSuccess: async () => {
      await utils.blog.invalidate();
      toast({
        variant: "default",
        title: "Der Blogeintrag wurde erstellt",
      });
      setTitle("");
      setDescription("");
      setSlug("");
      setFile(null);
    },
  });

  async function onSubmit() {
    if (!file) {
      alert("Bitte lade ein Titelbild hoch");
      return;
    }
    const image = await uploadImage(file);
    if (!image) {
      alert(
        "Es gab einen Fehler mit deinem Cover. Wende dich an unseren Support.",
      );
      return;
    }

    createBlog.mutate({
      title,
      description,
      slug,
      image
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="mt-2">
          Erstellen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Blogeintrag erstellen</DialogTitle>
          <DialogDescription>
            Hier kannst du einen Blogeintrag erstellen
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="linkname" className="text-right">
              Linkname
            </Label>
            <Input
              id="linkname"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Titel
            </Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Beschreibung
            </Label>
            <div className="col-span-3">
              <MDEditor 
              value={description} 
              // @ts-expect-error || @ts-ignore
              onChange={setDescription} />
            </div>
          </div>
        </div>
        <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
          <Label htmlFor="image">Titelbild</Label>
          <div className="flex flex-col gap-2">
            <Input
              id="image"
              type="file"
              accept=".jpg, .jpeg, .png"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setFile(e.target.files[0] ?? null);
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
              disabled={createBlog.isPending}
              onClick={onSubmit}
            >
              {createBlog.isPending ? "Wird erstellt..." : "Erstellen"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BlogsTable({ items }: { items: Blog[] }) {
  const utils = api.useUtils();
  const { toast } = useToast();
  const [editingItem, setEditingItem] = useState<string | null>(null);

  const deleteBlog = api.blog.delete.useMutation({
    onSuccess: async () => {
      await utils.blog.invalidate();
      toast({
        variant: "destructive",
        title: "Der Blogeintrag wurde erfolgreich gelöscht",
      });
    },
  });

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titel</TableHead>
            <TableHead>Datum</TableHead>
            <TableHead>Link</TableHead>
            <TableHead className="text-center">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={`${index}`}>
              <TableCell>{item.title}</TableCell>
              <TableCell>{item.date.toLocaleDateString("de-DE")}</TableCell>
              <TableCell>{item.slug}</TableCell>
              <TableCell className="flex items-center justify-between">
                <FileEditIcon
                  className="text-white transition-colors hover:cursor-pointer hover:text-yellow-500"
                  onClick={() => setEditingItem(item.id)}
                />
                <IconTrash
                  className="text-white transition-colors hover:cursor-pointer hover:text-red-500"
                  onClick={() => deleteBlog.mutate({ id: item.id })}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingItem && (
        <EditItem itemId={editingItem} onClose={() => setEditingItem(null)} />
      )}
    </div>
  );
}

function EditItem({
  itemId,
  onClose,
}: {
  itemId: string;
  onClose: () => void;
}) {
  const utils = api.useUtils();
  const { toast } = useToast();
  const { data: item } = api.blog.getById.useQuery({ id: itemId });

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [image, setImage] = useState<string | null>("");

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDescription(item.description);
      setSlug(item.slug);
      setImage(item.image);
    }
  }, [item]);

  const updateItem = api.blog.update.useMutation({
    onSuccess: async () => {
      await utils.blog.invalidate();
      toast({
        variant: "default",
        title: "Der Blogeintrag wurde erfolgreich gespeichert",
      });
      onClose();
    },
  });

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Blogeintrag bearbeiten</SheetTitle>
          <SheetDescription>
            Hier kannst du Änderungen an einem Blogeintrag vornehmen
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="linkname" className="text-right">
              Linkname
            </Label>
            <Input
              id="linkname"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Titel
            </Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Beschreibung
            </Label>
            <div className="col-span-3">
              <MDEditor
                value={description}
                // @ts-expect-error || @ts-ignore
                onChange={setDescription}
              />
            </div>
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button
              type="submit"
              disabled={updateItem.isPending}
              onClick={() =>
                updateItem.mutate({
                  id: itemId,
                  title,
                  description,
                  slug,
                  image,
                })
              }
            >
              {updateItem.isPending ? "Wird gespeichert..." : "Speichern"}
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

async function uploadImage(file: File) {
  const fileToUpload = file;
  const fileType = fileToUpload.type;
  const filename = fileToUpload.name;

  const signedUrlResponse = await fetch("/api/protected/s3/generateBlog", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filename,
      fileType,
    }),
  });

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
