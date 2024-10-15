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
import { type Post, type Campaign } from "@prisma/client";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { DeleteIcon, EditIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type CampaignNew = Campaign & {
  totalBudget: number;
  totalDays: number;
  totalSaves: number;
  posts: Post[];
};

export function Campaigns({ projectId }: { projectId: string }) {
  const [campaigns] = api.campaign.getAll.useSuspenseQuery({ projectId });

  return (
    <div className="flex w-full max-w-md flex-col">
      {campaigns.length !== 0 ? (
        // @ts-expect-error || already declared on top
        <CampaignsTable campaigns={campaigns} projectId={projectId} />
      ) : (
        <p>Du hast noch keine Kampagne erstellt</p>
      )}
      <CreateCampaign projectId={projectId} />
    </div>
  );
}

function CreateCampaign({ projectId }: { projectId: string }) {
  const { toast } = useToast();
  const utils = api.useUtils();
  const [name, setName] = useState<string>("");

  const createCampaign = api.campaign.create.useMutation({
    onSuccess: async () => {
      await utils.campaign.invalidate();
      toast({
        variant: "default",
        title: "Die Kampagne wurde erstellt",
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
          <DialogTitle>Kampagne erstellen</DialogTitle>
          <DialogDescription>
            Hier kannst du eine Kampagne erstellen
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
              disabled={createCampaign.isPending}
              onClick={() => createCampaign.mutate({ name, projectId })}
            >
              {createCampaign.isPending ? "Wird erstellt..." : "Erstellen"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CampaignsTable({
  campaigns,
  projectId,
}: {
  campaigns: CampaignNew[];
  projectId: string;
}) {
  const utils = api.useUtils();
  const { toast } = useToast();
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  const deleteCampaign = api.campaign.delete.useMutation({
    onSuccess: async () => {
      await utils.campaign.invalidate();
      toast({
        variant: "destructive",
        title: "Die Kampagne wurde erfolgreich gelöscht",
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
          {campaigns.map((campaign) => (
            <TableRow key={`${campaign.name}`}>
              <TableCell className="font-medium">
                <Link
                  href={`/project/${projectId}/campaign/${campaign.id}`}
                  className="hover:underline"
                >
                  {campaign.name}
                </Link>
              </TableCell>
              <TableCell>{campaign.totalDays} Tage</TableCell>
              <TableCell>{campaign.totalBudget} €</TableCell>
              <TableCell className="text-center">
                {campaign.totalSaves}
              </TableCell>
              <TableCell className="flex items-center justify-between">
                <EditIcon
                  className="hover:cursor-pointer"
                  onClick={() => setEditingCampaign(campaign)}
                />
                <DeleteIcon
                  color="red"
                  className="hover:cursor-pointer"
                  onClick={() => deleteCampaign.mutate({ id: campaign.id })}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingCampaign && (
        <EditCampaign
          campaign={editingCampaign}
          projectId={projectId}
          onClose={() => setEditingCampaign(null)}
        />
      )}
    </div>
  );
}

function EditCampaign({
  campaign,
  projectId,
  onClose,
}: {
  campaign: Campaign;
  projectId: string;
  onClose: () => void;
}) {
  const utils = api.useUtils();
  const { toast } = useToast();
  const [name, setName] = useState<string>(campaign.name);

  const updateCampaign = api.campaign.update.useMutation({
    onSuccess: async () => {
      await utils.campaign.invalidate();
      toast({
        variant: "default",
        title: "Die Kampagne wurde erfolgreich gespeichert",
      });
      onClose();
    },
  });

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Kampagne bearbeiten</SheetTitle>
          <SheetDescription>
            Hier kannst du Änderungen an deiner Kampagne vornehmen
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
              disabled={updateCampaign.isPending}
              onClick={() => updateCampaign.mutate({ id: campaign.id, name, projectId })}
            >
              {updateCampaign.isPending ? "Wird gespeichert..." : "Speichern"}
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}