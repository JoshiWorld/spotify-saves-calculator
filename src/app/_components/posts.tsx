"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { type Post } from "@prisma/client";

export function Posts({ campaignId }: { campaignId: string }) {
  const [posts] = api.post.getAll.useSuspenseQuery({ campaignId });

  const utils = api.useUtils();
  const [date, setDate] = useState<Date>(new Date());
  const [budget, setBudget] = useState<number>(0);
  const [saves, setSaves] = useState<number>(0);
  const [playlistAdds, setPlaylistAdds] = useState<number>(0);
  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
      setDate(new Date());
      setBudget(0);
      setSaves(0);
      setPlaylistAdds(0);
    },
  });

  return (
    <div className="w-full max-w-3xl">
      {posts.length !== 0 ? (
        <PostsTable posts={posts} />
      ) : (
        <p>Du hast noch keine Einträge erstellt</p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createPost.mutate({ campaignId, date, budget, saves, playlistAdds });
        }}
        className="flex flex-col gap-2"
      >
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
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              // @ts-expect-error || No error
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Input
          type="number"
          placeholder="Budget"
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
        />
        <Input
          type="number"
          placeholder="Saves"
          value={saves}
          onChange={(e) => setSaves(Number(e.target.value))}
        />
        <Input
          type="number"
          placeholder="PlaylistAdds"
          value={playlistAdds}
          onChange={(e) => setPlaylistAdds(Number(e.target.value))}
        />
        <button
          type="submit"
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
          disabled={createPost.isPending}
        >
          {createPost.isPending ? "Wird erstellt..." : "Erstellen"}
        </button>
      </form>
    </div>
  );
}

function PostsTable({ posts }: { posts: Post[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Datum</TableHead>
          <TableHead>Budget</TableHead>
          <TableHead>Saves</TableHead>
          <TableHead>Playlist-Adds</TableHead>
          <TableHead>Gesamt</TableHead>
          <TableHead className="text-right">CPS</TableHead>
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
              className={`text-right ${
                post.budget / (post.saves + post.playlistAdds) < 0.3
                  ? "bg-green-800"
                  : post.budget / (post.saves + post.playlistAdds) < 0.5
                    ? "bg-yellow-800"
                    : "bg-red-800"
              }`}
            >
              {(post.budget / (post.saves + post.playlistAdds)).toFixed(2)} €
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
