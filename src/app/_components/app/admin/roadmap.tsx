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
import { CalendarIcon, FileEditIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, RoadmapItem, RoadmapStatus } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type MinRoadmapItem = {
  description: string;
    status: RoadmapStatus;
    category: string;
    id: string;
    title: string;
    targetDate: Date;
    votes: number;
};

export function AdminRoadmaps() {
  const { data, isLoading, error } = api.roadmap.getAll.useQuery();

  if (isLoading) return <p>Loading Roadmaps..</p>;
  if(!data) {
    console.log(error);
    return <p>Error loading Roadmaps. Watch console</p>;
  }

  return (
    <div className="flex w-full flex-col">
      {data.length !== 0 ? (
        <RoadmapsTable items={data} />
      ) : (
        <p>Es gibt noch keine Roadmaps.</p>
      )}
    </div>
  );
}

function RoadmapsTable({ items }: { items: MinRoadmapItem[] }) {
  const [editingItem, setEditingItem] = useState<string | null>(null);

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titel</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Kategorie</TableHead>
            <TableHead>Ziel-Datum</TableHead>
            <TableHead>Votes</TableHead>
            <TableHead className="text-center">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={`${index}`}>
              <TableCell>{item.title}</TableCell>
              <TableCell>{item.status}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>{item.targetDate.toLocaleDateString('de-DE')}</TableCell>
              <TableCell>{item.votes}</TableCell>
              <TableCell className="flex justify-center">
                <FileEditIcon
                  className="text-white transition-colors hover:cursor-pointer hover:text-yellow-500"
                  onClick={() => setEditingItem(item.id)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingItem && (
        <EditItem
          itemId={editingItem}
          onClose={() => setEditingItem(null)}
        />
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
  const { data: item } = api.roadmap.get.useQuery({ id: itemId });

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [status, setStatus] = useState<RoadmapStatus>(RoadmapStatus.PLANNED);
  const [category, setCategory] = useState<string>("");
  const [targetDate, setTargetDate] = useState<Date>(new Date());

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDescription(item.description);
      setStatus(item.status);
      setCategory(item.category);
      setTargetDate(item.targetDate);
    }
  }, [item]);

  const updateItem = api.roadmap.update.useMutation({
    onSuccess: async () => {
      await utils.roadmap.invalidate();
      toast({
        variant: "default",
        title: "Der Roadmapeintrag wurde erfolgreich gespeichert",
      });
      onClose();
    },
  });

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Roadmapeintrag bearbeiten</SheetTitle>
          <SheetDescription>
            Hier kannst du Änderungen an einem Roadmapeintrag vornehmen
          </SheetDescription>
        </SheetHeader>
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
            <Input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as RoadmapStatus)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {Object.values(RoadmapStatus).map((status, index) => (
                    <SelectItem key={index} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Ziel-Datum
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !targetDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon />
                  {targetDate ? format(targetDate, "PPP") : <span>Datum auswählen</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={targetDate}
                  // @ts-expect-error || @ts-ignore
                  onSelect={setTargetDate}
                />
              </PopoverContent>
            </Popover>
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
                  status,
                  category,
                  targetDate,
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
