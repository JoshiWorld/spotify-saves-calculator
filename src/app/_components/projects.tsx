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
import { Skeleton } from "@/components/ui/skeleton";
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
import { type Campaign, type Post, type Project } from "@prisma/client";
import Link from "next/link";
import { DeleteIcon, EditIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProjectNew = Project & {
  totalBudget: number;
  totalDays: number;
  totalSaves: number;
  campaigns: Campaign & {
    posts: Post[];
  };
};

export function Projects() {
  // const [projects] = api.project.getAll.useSuspenseQuery();
  const { data: projects, isLoading } = api.project.getAll.useQuery();

  if(isLoading) return <LoadingCard />;
  if(!projects) return <p>Server error</p>;

  return (
    <div className="flex w-full max-w-md flex-col">
      {projects.length !== 0 ? (
        // @ts-expect-error || list is always the type of ProjectNew
        <ProjectsTable projects={projects} />
      ) : (
        <p>Du hast noch kein Projekt erstellt</p>
      )}
      <CreateProject />
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[125px] w-[250px] rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}

function CreateProject() {
  const { toast } = useToast();
  const utils = api.useUtils();
  const [name, setName] = useState<string>("");

  const createProject = api.project.create.useMutation({
    onSuccess: async () => {
      await utils.project.invalidate();
      toast({
        variant: "default",
        title: "Das Projekt wurde erstellt",
        description: `Name: ${name}`,
      });
      setName("");
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
          <DialogTitle>Projekt erstellen</DialogTitle>
          <DialogDescription>
            Hier kannst du ein Projekt erstellen
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
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
              disabled={createProject.isPending}
              onClick={() => createProject.mutate({ name })}
            >
              {createProject.isPending ? "Wird erstellt..." : "Erstellen"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProjectsTable({ projects }: { projects: ProjectNew[] }) {
  const utils = api.useUtils();
  const { toast } = useToast();
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const deleteProject = api.project.delete.useMutation({
    onSuccess: async () => {
      await utils.project.invalidate();
      toast({
        variant: "destructive",
        title: "Das Projekt wurde erfolgreich gelöscht",
      });
    }
  });

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Laufzeit</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Saves + Adds</TableHead>
            <TableHead className="text-center">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={`${project.name}`}>
              <TableCell className="font-medium">
                <Link
                  href={`/project/${project.id}`}
                  className="hover:underline"
                >
                  {project.name}
                </Link>
              </TableCell>
              <TableCell>{project.totalDays} Tage</TableCell>
              <TableCell>{project.totalBudget} €</TableCell>
              <TableCell className="text-center">{project.totalSaves}</TableCell>
              <TableCell className="flex justify-between items-center">
                <EditIcon
                  className="hover:cursor-pointer"
                  onClick={() => setEditingProject(project)}
                />
                <DeleteIcon
                  color="red"
                  className="hover:cursor-pointer"
                  onClick={() => deleteProject.mutate({ id: project.id })}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingProject && (
        <EditProject
          project={editingProject}
          onClose={() => setEditingProject(null)} 
        />
      )}
    </div>
  );
}

function EditProject({ project, onClose }: { project: Project; onClose: () => void }) {
  const utils = api.useUtils();
  const { toast } = useToast();
  const [name, setName] = useState<string>(project.name);

  const updateProject = api.project.update.useMutation({
    onSuccess: async () => {
      await utils.project.invalidate();
      toast({
        variant: "default",
        title: "Das Projekt wurde erfolgreich gespeichert",
      });
      onClose();
    },
  });

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Projekt bearbeiten</SheetTitle>
          <SheetDescription>
            Hier kannst du Änderungen an deinem Projekt vornehmen
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
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
              disabled={updateProject.isPending}
              onClick={() => updateProject.mutate({ id: project.id, name })}
            >
              {updateProject.isPending ? "Wird gespeichert..." : "Speichern"}
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
