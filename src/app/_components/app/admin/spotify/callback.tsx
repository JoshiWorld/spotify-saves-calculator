"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/trpc/react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function SpotifyCallback() {
  const { toast } = useToast();
  const utils = api.useUtils();

  const searchParams = useSearchParams();
  const authCode = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const spotify = api.spotify.generateToken.useMutation({
    onSuccess: async (res) => {
      await utils.spotify.invalidate();
      toast({
        variant: "default",
        title: res.message,
        description: res.accessToken,
      });
    }
  });

  useEffect(() => {
    if (authCode && state) {
      spotify.mutate({
        authCode,
        state,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authCode, state]);

  if(error) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-5">
        <p>Es gab einen Fehler beim Anmelden.</p>
        <p>Fehlercode: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center w-full gap-5">
      <p>Auth-Code wurde angelegt.</p>
      <Button>Tokens generieren</Button>
    </div>
  );
}
