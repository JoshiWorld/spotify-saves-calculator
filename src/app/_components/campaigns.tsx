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
import { type Campaign } from "@prisma/client";
import Link from "next/link";

export function Campaigns({ projectId }: { projectId: string }) {
  const [campaigns] = api.campaign.getAll.useSuspenseQuery({ projectId });

  const utils = api.useUtils();
  const [name, setName] = useState("");
  const createCampaign = api.campaign.create.useMutation({
    onSuccess: async () => {
      await utils.campaign.invalidate();
      setName("");
    },
  });

  return (
    <div className="w-full max-w-xs">
      {campaigns.length !== 0 ? (
        <CampaignsTable campaigns={campaigns} projectId={projectId} />
      ) : (
        <p>Du hast noch keine Kampagne erstellt</p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createCampaign.mutate({ projectId, name });
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
          disabled={createCampaign.isPending}
        >
          {createCampaign.isPending ? "Wird erstellt..." : "Erstellen"}
        </button>
      </form>
    </div>
  );
}

function CampaignsTable({ campaigns, projectId }: { campaigns: Campaign[], projectId: string }) {
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
        {campaigns.map((campaign) => (
          <TableRow key={`${campaign.name}`}>
            <TableCell className="font-medium">
              <Link href={`/project/${projectId}/campaign/${campaign.id}`}>
                {campaign.name}
              </Link>
            </TableCell>
            <TableCell>5 Tage</TableCell>
            <TableCell className="text-right">250,00 €</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
