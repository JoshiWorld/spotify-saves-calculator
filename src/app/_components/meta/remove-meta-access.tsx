"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/trpc/react";

export function RemoveMetaAccess() {
  const utils = api.useUtils();
  const { toast } = useToast();

  const removeMetaAccess = api.user.removeMetaAccess.useMutation({
    onSuccess: async () => {
      await utils.user.invalidate();
      toast({
        variant: "default",
        title: "Dein Meta-Zugriff wurde entfernt.",
      });
    },
  });

  return (
    <Button
      onClick={() => removeMetaAccess.mutate()}
      disabled={removeMetaAccess.isPending}
    >
      {removeMetaAccess.isPending
        ? "Meta-Zugriff wird entfernt.."
        : "Meta-Zugriff entfernen"
        }
    </Button>
  );
}
