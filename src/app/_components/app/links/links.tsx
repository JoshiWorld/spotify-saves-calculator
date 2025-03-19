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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckIcon, FileEditIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ClipboardIcon, OpenInNewWindowIcon } from "@radix-ui/react-icons";
import { IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

type LinkView = {
  id: string;
  name: string;
  artist: string;
  songtitle: string;
  pixelId: string;
  testMode: boolean;
  splittest: boolean;
};

export function Links() {
  const router = useRouter();
  const [links] = api.link.getAllView.useSuspenseQuery();

  return (
    <div className="flex w-full flex-col">
      {links.length !== 0 ? (
        <LinksTable links={links} />
      ) : (
        <p>Du hast noch keinen Link erstellt</p>
      )}
      <Button variant="default" className="mt-2" onClick={() => router.push("/app/links/create")}>
        Erstellen
      </Button>
      {/* <CreateLink /> */}
    </div>
  );
}

function LinksTable({ links }: { links: LinkView[] }) {
  const router = useRouter();
  const utils = api.useUtils();
  const { toast } = useToast();
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const deleteLink = api.link.delete.useMutation({
    onSuccess: async () => {
      await utils.link.invalidate();
      toast({
        variant: "destructive",
        title: "Der Link wurde erfolgreich gelöscht",
      });
    },
    onError: (error) => {
      console.error("Fehler beim Löschen des Links:", error);
      toast({
        variant: "destructive",
        title: "Fehler beim Löschen des Links",
      });
    }
  });

  const copyLink = async (url: string, artist: string) => {
    const fullUrl = `${window.location.origin}/link/${artist.toLowerCase().replace(/\s+/g, '')}/${url}`;

    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedLink(url);
    } catch (err) {
      console.error("Fehler beim Kopieren in die Zwischenablage:", err);
    }
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[500px]">Titel</TableHead>
            <TableHead className="text-center">URL</TableHead>
            <TableHead>Artist</TableHead>
            <TableHead>Test-Modus</TableHead>
            <TableHead>Splittesting</TableHead>
            <TableHead className="w-[100px] text-center">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {links.map((link) => (
            <TableRow key={`${link.name}`}>
              <TableCell
                className="font-medium hover:cursor-pointer hover:underline"
                onClick={() => router.push(`/app/links/stats/${link.id}`)}
              >
                {link.songtitle}
              </TableCell>
              <TableCell className="flex items-center justify-evenly">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {!copiedLink || copiedLink !== link.name ? (
                        <ClipboardIcon
                          className="cursor-pointer"
                          onClick={() => copyLink(link.name, link.artist)}
                        />
                      ) : (
                        <CheckIcon />
                      )}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Link kopieren</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <OpenInNewWindowIcon
                        className="cursor-pointer"
                        onClick={() => {
                          const fullUrl = `${window.location.origin}/link/${link.artist
                            .toLowerCase()
                            .replace(/\s+/g, "")}/${link.name}`;
                          window.open(fullUrl, "_blank");
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Link öffnen</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell>{link.artist}</TableCell>
              <TableCell>{link.testMode ? "An" : "Aus"}</TableCell>
              <TableCell>{link.splittest ? "An" : "Aus"}</TableCell>
              <TableCell className="flex items-center justify-between">
                <FileEditIcon
                  className="transition-colors hover:cursor-pointer hover:text-yellow-500"
                  // onClick={() => setEditingLink(link.id)}
                  onClick={() => router.push(`/app/links/edit/${link.id}`)}
                />
                <IconTrash
                  className="transition-colors hover:cursor-pointer hover:text-red-500"
                  onClick={() => deleteLink.mutate({ id: link.id })}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}