"use client";

import { type Dispatch, type SetStateAction, useState } from "react";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon, FileEditIcon } from "lucide-react";
import { IconTrash } from "@tabler/icons-react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { PostCPSChart } from "./posts/cps-chart";
import { PostBudgetChart } from "./posts/budget-chart";
import { PostSavesChart } from "./posts/saves-chart";
import { type DateRange } from "react-day-picker";

type MinPost = {
  date: Date;
  id: string;
  saves: number;
  playlistAdds: number;
  budget: number;
  endDate: Date | null;
};

export function Posts({ campaignId }: { campaignId: string }) {
  const [page, setPage] = useState<number>(1);
  const [user] = api.user.getMetaToken.useSuspenseQuery();
  const [posts] = api.post.getAll.useSuspenseQuery({ campaignId, page });

  return (
    <div className="max-w-screen-3xl flex flex-col items-center">
      <div className="flex w-full max-w-3xl flex-col">
        {posts.totalPosts !== 0 ? (
          <PostsTable posts={posts.posts} campaignId={campaignId} />
        ) : (
          <p>Du hast noch keine Einträge erstellt</p>
        )}
        <div className="py-5">
          <Pages page={page} setPage={setPage} totalPages={posts.totalPages} />
        </div>
        <CreatePost
          campaignId={campaignId}
          metaAccessToken={user?.metaAccessToken}
        />
      </div>
      {posts.totalPosts !== 0 && (
        <div className="mt-10 flex flex-col justify-between">
          <div className="py-3">
            <PostCPSChart posts={posts.posts} />
          </div>
          <div className="py-3">
            <PostBudgetChart posts={posts.posts} />
          </div>
          <div className="py-3">
            <PostSavesChart posts={posts.posts} />
          </div>
        </div>
      )}
    </div>
  );
}

function Pages({
  page,
  setPage,
  totalPages,
}: {
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  totalPages: number;
}) {
  const handlePrevious = () => {
    if (page > 1) setPage(page - 1);
  };
  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          {page !== 1 && (
            <PaginationPrevious
              className="cursor-pointer"
              onClick={handlePrevious}
            />
          )}
        </PaginationItem>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <PaginationItem key={p}>
            <PaginationLink
              href="#"
              isActive={p === page}
              onClick={() => setPage(p)}
            >
              {p}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          {page !== totalPages && (
            <PaginationNext className="cursor-pointer" onClick={handleNext} />
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function CreatePost({
  campaignId,
  metaAccessToken,
}: {
  campaignId: string;
  metaAccessToken: string | null | undefined;
}) {
  const { toast } = useToast();
  const utils = api.useUtils();
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 1),
  });
  const [saves, setSaves] = useState<string>("0");
  const [budget, setBudget] = useState<string>("0");
  const [playlistAdds, setPlaylistAdds] = useState<string>("0");

  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();

      toast({
        variant: "default",
        title: "Der Eintrag wurde erstellt",
      });
      setDate({
        from: new Date(),
        to: addDays(new Date(), 1),
      });
      setBudget("0");
      setSaves("0");
      setPlaylistAdds("0");
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Fehler beim Erstellen des Eintrags",
        description: `Fehlermeldung: ${err.message}`,
      });
      console.error(err);
    },
  });

  const handleCreatePost = () => {
    const budgetNumber = Number(budget.replace(",", ".").replaceAll(" ", ""));
    const playlistAddsNumber = Number(
      playlistAdds.replace(",", ".").replaceAll(" ", ""),
    );
    const savesNumber = Number(saves.replace(",", ".").replaceAll(" ", ""));

    if (metaAccessToken) {
      createPost.mutate({
        campaignId,
        date: date!.from!,
        endDate: date?.to,
        saves: savesNumber,
        playlistAdds: playlistAddsNumber,
      });
    } else {
      createPost.mutate({
        campaignId,
        date: date!.from!,
        endDate: date?.to,
        saves: savesNumber,
        playlistAdds: playlistAddsNumber,
        budget: budgetNumber,
      });
    }
  };

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
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Datum auswählen</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="range"
                  selected={date}
                  defaultMonth={date?.from}
                  onSelect={setDate}
                  // initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          {!metaAccessToken && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="budget" className="text-right">
                Budget
              </Label>
              <Input
                id="budget"
                type="text"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="col-span-3"
              />
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="saves" className="text-right">
              Saves
            </Label>
            <Input
              id="saves"
              type="text"
              value={saves}
              onChange={(e) => setSaves(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="playlistAdds" className="text-right">
              Playlist-Adds
            </Label>
            <Input
              id="playlistAdds"
              type="text"
              value={playlistAdds}
              onChange={(e) => setPlaylistAdds(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="submit"
              disabled={createPost.isPending}
              onClick={handleCreatePost}
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
  posts: MinPost[];
  campaignId: string;
}) {
  const [user] = api.user.getCPS.useSuspenseQuery();
  const utils = api.useUtils();
  const { toast } = useToast();
  const [editingPost, setEditingPost] = useState<MinPost | null>(null);

  const averageCPS =
    posts.reduce(
      (total, post) => total + post.budget / (post.saves + post.playlistAdds),
      0,
    ) / posts.length;
  const averageGesamt =
    posts.reduce((total, post) => total + (post.saves + post.playlistAdds), 0) /
    posts.length;
  const averageSaves =
    posts.reduce((total, post) => total + post.saves, 0) / posts.length;
  const averageAdds =
    posts.reduce((total, post) => total + post.playlistAdds, 0) / posts.length;
  const averageBudget =
    posts.reduce((total, post) => total + post.budget, 0) / posts.length;

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
                {post.endDate && post.date !== post.endDate
                  ? `${post.date.toLocaleDateString()}-${post.endDate.toLocaleDateString()}`
                  : post.date.toLocaleDateString()}
              </TableCell>
              <TableCell>
                {post.budget.toLocaleString("de-DE", {
                  style: "currency",
                  currency: "EUR",
                })}
              </TableCell>
              <TableCell>{post.saves}</TableCell>
              <TableCell>{post.playlistAdds}</TableCell>
              <TableCell>{post.saves + post.playlistAdds}</TableCell>
              <TableCell
                className={`text-center ${
                  post.budget / (post.saves + post.playlistAdds) < user!.goodCPS
                    ? "bg-green-800"
                    : post.budget / (post.saves + post.playlistAdds) <
                        user!.midCPS
                      ? "bg-yellow-800"
                      : "bg-red-800"
                }`}
              >
                {(
                  post.budget /
                  (post.saves + post.playlistAdds)
                ).toLocaleString("de-DE", {
                  style: "currency",
                  currency: "EUR",
                })}
              </TableCell>
              <TableCell className="flex items-center justify-between">
                <FileEditIcon
                  className="text-white transition-colors hover:cursor-pointer hover:text-yellow-500"
                  onClick={() => setEditingPost(post)}
                />
                <IconTrash
                  className="text-white transition-colors hover:cursor-pointer hover:text-red-500"
                  onClick={() => deletePost.mutate({ id: post.id })}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Durchschnitt</TableCell>
            <TableCell>
              {averageBudget.toLocaleString("de-DE", {
                style: "currency",
                currency: "EUR",
              })}
            </TableCell>
            <TableCell>{averageSaves.toFixed(2)}</TableCell>
            <TableCell>{averageAdds.toFixed(2)}</TableCell>
            <TableCell>{averageGesamt.toFixed(2)}</TableCell>
            <TableCell className="text-center">
              {averageCPS.toLocaleString("de-DE", {
                style: "currency",
                currency: "EUR",
              })}
            </TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableFooter>
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
  post: MinPost;
  campaignId: string;
  onClose: () => void;
}) {
  const utils = api.useUtils();
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date(post.date));
  const [budget, setBudget] = useState<string>(String(post.budget));
  const [saves, setSaves] = useState<string>(String(post.saves));
  const [playlistAdds, setPlaylistAdds] = useState<string>(
    String(post.playlistAdds),
  );

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

  const handleUpdatePost = () => {
    const budgetNumber = Number(budget.replace(",", ".").replaceAll(" ", ""));
    const playlistAddsNumber = Number(
      playlistAdds.replace(",", ".").replaceAll(" ", ""),
    );
    const savesNumber = Number(saves.replace(",", ".").replaceAll(" ", ""));

    updatePost.mutate({
      id: post.id,
      campaignId,
      saves: savesNumber,
      playlistAdds: playlistAddsNumber,
      date,
      budget: budgetNumber,
    });
  };

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
              type="text"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="saves" className="text-right">
              Saves
            </Label>
            <Input
              id="saves"
              type="text"
              value={saves}
              onChange={(e) => setSaves(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="playlistAdds" className="text-right">
              Playlist-Adds
            </Label>
            <Input
              id="playlistAdds"
              type="text"
              value={playlistAdds}
              onChange={(e) => setPlaylistAdds(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button
              type="submit"
              disabled={updatePost.isPending}
              onClick={handleUpdatePost}
            >
              {updatePost.isPending ? "Wird gespeichert..." : "Speichern"}
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
