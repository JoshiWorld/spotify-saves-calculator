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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type MetaAccount,
} from "@prisma/client";
import Link from "next/link";
import { FileEditIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconTrash } from "@tabler/icons-react";

type ProjectNew = {
  name: string;
  id: string;
  metaAccountId: string | null;
  totalBudget: string;
  totalDays: number;
  totalSaves: number;
  campaigns: {
    posts: {
      date: Date;
      budget: number;
      saves: number;
      playlistAdds: number;
    }[];
  }[];
};

export function Projects() {
  const [user] = api.user.getMetaToken.useSuspenseQuery();
  const [projects] = api.project.getAll.useSuspenseQuery();
  const {
    data: accounts,
    isLoading,
    isError,
    error,
  } = api.meta.getMetaAccounts.useQuery(undefined, {
    enabled: !!user?.metaAccessToken,
  });

  if (isLoading) return <p>Loading Meta Accounts</p>
  if (isError) return <p>Server error: {error?.message}</p>;

  return (
    <div className="flex w-full flex-col">
      {projects.length !== 0 ? (
        <ProjectsTable projects={projects} accounts={accounts} />
      ) : (
        <p>Du hast noch kein Projekt erstellt</p>
      )}
      <CreateProject accounts={accounts} />
    </div>
  );
}

function CreateProject({ accounts }: { accounts: MetaAccount[] | undefined }) {
  const { toast } = useToast();
  const utils = api.useUtils();
  const [name, setName] = useState<string>("");
  const [metaAccountId, setMetaAccountId] = useState<string>("");

  const createProject = api.project.create.useMutation({
    onSuccess: async () => {
      await utils.project.invalidate();
      toast({
        variant: "default",
        title: "Das Projekt wurde erstellt",
        description: `Name: ${name}`,
      });
      setName("");
      setMetaAccountId("");
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex justify-center">
          <Button variant="default" className="mt-2">
            Erstellen
          </Button>
        </div>
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
        {accounts && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Meta-Ad-Account
              </Label>
              <Select value={metaAccountId} onValueChange={setMetaAccountId}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="AD-Account auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {accounts.map((meta, index) => (
                      <SelectItem key={index} value={meta.id}>
                        {meta.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="submit"
              disabled={createProject.isPending}
              onClick={() =>
                accounts
                  ? createProject.mutate({ name, metaAccountId })
                  : createProject.mutate({ name })
              }
            >
              {createProject.isPending ? "Wird erstellt..." : "Erstellen"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProjectsTable({
  projects,
  accounts,
}: {
  projects: ProjectNew[];
  accounts: MetaAccount[] | undefined;
}) {
  const utils = api.useUtils();
  const { toast } = useToast();
  const [editingProject, setEditingProject] = useState<ProjectNew | null>(null);

  const deleteProject = api.project.delete.useMutation({
    onSuccess: async () => {
      await utils.project.invalidate();
      toast({
        variant: "destructive",
        title: "Das Projekt wurde erfolgreich gelöscht",
      });
    },
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
                  href={`/app/projects/project/${project.id}`}
                  className="hover:underline"
                >
                  {project.name}
                </Link>
              </TableCell>
              <TableCell>{project.totalDays} Tage</TableCell>
              <TableCell>{project.totalBudget} €</TableCell>
              <TableCell>{project.totalSaves}</TableCell>
              <TableCell className="flex items-center justify-between">
                <FileEditIcon
                  className="transition-colors hover:cursor-pointer hover:text-yellow-500"
                  onClick={() => setEditingProject(project)}
                />
                <IconTrash
                  className="transition-colors hover:cursor-pointer hover:text-red-500"
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
          accounts={accounts}
          onClose={() => setEditingProject(null)}
        />
      )}
    </div>
  );
}

function EditProject({
  project,
  accounts,
  onClose,
}: {
  project: ProjectNew;
  accounts: MetaAccount[] | undefined;
  onClose: () => void;
}) {
  const utils = api.useUtils();
  const { toast } = useToast();
  const [name, setName] = useState<string>(project.name);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const [metaAccountId, setMetaAccountId] = useState<string | null>(
    project.metaAccountId,
  );

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
        {accounts && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Meta-Ad-Account
              </Label>
              <Select value={metaAccountId ?? undefined} onValueChange={setMetaAccountId}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="AD-Account auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {accounts.map((meta, index) => (
                      <SelectItem key={index} value={meta.id}>
                        {meta.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
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
