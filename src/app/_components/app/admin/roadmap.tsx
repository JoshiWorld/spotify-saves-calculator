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
import { RoadmapStatus } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
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
import { Textarea } from "@/components/ui/textarea";
import { IconTrash } from "@tabler/icons-react";

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
  if (!data) {
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
      <CreateRoadmap />
    </div>
  );
}

function CreateRoadmap() {
  const { toast } = useToast();
  const utils = api.useUtils();

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [status, setStatus] = useState<RoadmapStatus>(RoadmapStatus.PLANNED);
  const [category, setCategory] = useState<string>("");
  const [targetDate, setTargetDate] = useState<Date>(new Date());

  const createRoadmap = api.roadmap.create.useMutation({
    onSuccess: async () => {
      await utils.roadmap.invalidate();
      toast({
        variant: "default",
        title: "Die Roadmap wurde erstellt",
      });
      setTitle("");
      setDescription("");
      setStatus(RoadmapStatus.PLANNED);
      setCategory("");
      setTargetDate(new Date());
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="mt-2">
          Erstellen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Roadmap erstellen</DialogTitle>
          <DialogDescription>
            Hier kannst du eine Roadmap erstellen
          </DialogDescription>
        </DialogHeader>
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
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="Beschreibung hinzufügen.."
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
                  {targetDate ? (
                    format(targetDate, "PPP")
                  ) : (
                    <span>Datum auswählen</span>
                  )}
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
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Kategorie
            </Label>
            <Input
              id="category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="submit"
              disabled={createRoadmap.isPending}
              onClick={() =>
                createRoadmap.mutate({
                  title,
                  description,
                  status,
                  targetDate,
                  category,
                })
              }
            >
              {createRoadmap.isPending ? "Wird erstellt..." : "Erstellen"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RoadmapsTable({ items }: { items: MinRoadmapItem[] }) {
  const utils = api.useUtils();
  const { toast } = useToast();
  const [editingItem, setEditingItem] = useState<string | null>(null);

  const deleteRoadmap = api.roadmap.delete.useMutation({
    onSuccess: async () => {
      await utils.roadmap.invalidate();
      toast({
        variant: "destructive",
        title: "Die Roadmap wurde erfolgreich gelöscht",
      });
    },
  });

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
              <TableCell>
                {item.targetDate.toLocaleDateString("de-DE")}
              </TableCell>
              <TableCell>{item.votes}</TableCell>
              <TableCell className="flex items-center justify-between">
                <FileEditIcon
                  className="text-white transition-colors hover:cursor-pointer hover:text-yellow-500"
                  onClick={() => setEditingItem(item.id)}
                />
                <IconTrash
                  className="text-white transition-colors hover:cursor-pointer hover:text-red-500"
                  onClick={() => deleteRoadmap.mutate({ id: item.id })}
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
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="Beschreibung hinzufügen.."
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
                  {targetDate ? (
                    format(targetDate, "PPP")
                  ) : (
                    <span>Datum auswählen</span>
                  )}
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
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Kategorie
            </Label>
            <Input
              id="category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="col-span-3"
            />
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
