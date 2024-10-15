"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, DeleteIcon, EditIcon } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { type Post } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

export function Posts({ campaignId }: { campaignId: string }) {
  const [posts] = api.post.getAll.useSuspenseQuery({ campaignId });

  return (
    <div className="flex w-full max-w-3xl flex-col">
      {posts.length !== 0 ? (
        <PostsTable posts={posts} campaignId={campaignId} />
      ) : (
        <p>Du hast noch keine Einträge erstellt</p>
      )}
      <CreatePost campaignId={campaignId} />
    </div>
  );
}

function CreatePost({ campaignId }: { campaignId: string }) {
  const { toast } = useToast();
  const utils = api.useUtils();
  const [date, setDate] = useState<Date>(new Date());
  const [budget, setBudget] = useState<number>(0);
  const [saves, setSaves] = useState<number>(0);
  const [playlistAdds, setPlaylistAdds] = useState<number>(0);

  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
      toast({
        variant: "default",
        title: "Der Eintrag wurde erstellt",
      });
      setDate(new Date());
      setBudget(0);
      setSaves(0);
      setPlaylistAdds(0);
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="mt-2">
          Erstellen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Eintrag erstellen</DialogTitle>
          <DialogDescription>
            Hier kannst du einen Eintrag erstellen
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Datum
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Datum auswählen</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  // @ts-expect-error || No error
                  onSelect={setDate}
                  // initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="budget" className="text-right">
              Budget
            </Label>
            <Input
              id="budget"
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="saves" className="text-right">
              Saves
            </Label>
            <Input
              id="saves"
              type="number"
              value={saves}
              onChange={(e) => setSaves(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="playlistAdds" className="text-right">
              Playlist-Adds
            </Label>
            <Input
              id="playlistAdds"
              type="number"
              value={playlistAdds}
              onChange={(e) => setPlaylistAdds(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="submit"
              disabled={createPost.isPending}
              onClick={() => createPost.mutate({ campaignId, date, budget, saves, playlistAdds })}
            >
              {createPost.isPending ? "Wird erstellt..." : "Erstellen"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PostsTable({
  posts,
  campaignId,
}: {
  posts: Post[];
  campaignId: string;
}) {
  const utils = api.useUtils();
  const { toast } = useToast();
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const deletePost = api.post.delete.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
      toast({
        variant: "destructive",
        title: "Der Eintrag wurde erfolgreich gelöscht",
      });
    },
  });

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Datum</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Saves</TableHead>
            <TableHead>Playlist-Adds</TableHead>
            <TableHead>Gesamt</TableHead>
            <TableHead className="text-center">CPS</TableHead>
            <TableHead className="text-center">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={`${post.id}`}>
              <TableCell className="font-medium">
                {post.date.toLocaleDateString()}
              </TableCell>
              <TableCell>{post.budget} €</TableCell>
              <TableCell>{post.saves}</TableCell>
              <TableCell>{post.playlistAdds}</TableCell>
              <TableCell>{post.saves + post.playlistAdds}</TableCell>
              <TableCell
                className={`text-center ${
                  post.budget / (post.saves + post.playlistAdds) < 0.3
                    ? "bg-green-800"
                    : post.budget / (post.saves + post.playlistAdds) < 0.5
                      ? "bg-yellow-800"
                      : "bg-red-800"
                }`}
              >
                {(post.budget / (post.saves + post.playlistAdds)).toFixed(2)} €
              </TableCell>
              <TableCell className="flex items-center justify-between">
                <EditIcon
                  className="hover:cursor-pointer"
                  onClick={() => setEditingPost(post)}
                />
                <DeleteIcon
                  color="red"
                  className="hover:cursor-pointer"
                  onClick={() => deletePost.mutate({ id: post.id })}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingPost && (
        <EditPost
          post={editingPost}
          campaignId={campaignId}
          onClose={() => setEditingPost(null)}
        />
      )}
    </div>
  );
}

function EditPost({
  post,
  campaignId,
  onClose,
}: {
  post: Post;
  campaignId: string;
  onClose: () => void;
}) {
  const utils = api.useUtils();
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date(post.date));
  const [budget, setBudget] = useState<number>(post.budget);
  const [saves, setSaves] = useState<number>(post.saves);
  const [playlistAdds, setPlaylistAdds] = useState<number>(post.playlistAdds);

  const updatePost = api.post.update.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
      toast({
        variant: "default",
        title: "Der Eintrag wurde erfolgreich gespeichert",
      });
      onClose();
    },
  });

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Eintrag bearbeiten</SheetTitle>
          <SheetDescription>
            Hier kannst du Änderungen an deinem Eintrag vornehmen
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Datum
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Datum auswählen</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  // @ts-expect-error || No error
                  onSelect={setDate}
                  // initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="budget" className="text-right">
              Budget
            </Label>
            <Input
              id="budget"
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="saves" className="text-right">
              Saves
            </Label>
            <Input
              id="saves"
              type="number"
              value={saves}
              onChange={(e) => setSaves(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="playlistAdds" className="text-right">
              Playlist-Adds
            </Label>
            <Input
              id="playlistAdds"
              type="number"
              value={playlistAdds}
              onChange={(e) => setPlaylistAdds(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button
              type="submit"
              disabled={updatePost.isPending}
              onClick={() =>
                updatePost.mutate({
                  id: post.id,
                  campaignId,
                  saves,
                  playlistAdds,
                  date,
                  budget,
                })
              }
            >
              {updatePost.isPending ? "Wird gespeichert..." : "Speichern"}
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}