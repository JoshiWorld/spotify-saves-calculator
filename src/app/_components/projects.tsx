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
import { type Project } from "@prisma/client";
import Link from "next/link";

export function Projects() {
  const [projects] = api.project.getAll.useSuspenseQuery();

  const utils = api.useUtils();
  const [name, setName] = useState("");
  const createProject = api.project.create.useMutation({
    onSuccess: async () => {
      await utils.project.invalidate();
      setName("");
    },
  });

  return (
    <div className="w-full max-w-xs">
      {projects.length !== 0 ? (
        <ProjectsTable projects={projects} />
      ) : (
        <p>Du hast noch kein Projekt erstellt</p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createProject.mutate({ name });
        }}
        className="flex flex-col gap-2"
      >
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-full px-4 py-2"
        />
        <button
          type="submit"
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
          disabled={createProject.isPending}
        >
          {createProject.isPending ? "Wird erstellt..." : "Erstellen"}
        </button>
      </form>
    </div>
  );
}

function ProjectsTable({ projects }: { projects: Project[] }) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Name</TableHead>
            <TableHead>Laufzeit</TableHead>
            <TableHead className="text-right">Budget</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={`${project.name}`}>
              <TableCell className="font-medium">
                <Link href={`/project/${project.id}`}>{project.name}</Link>
              </TableCell>
              <TableCell>5 Tage</TableCell>
              <TableCell className="text-right">250,00 €</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
}
