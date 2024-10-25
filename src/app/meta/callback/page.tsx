"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/trpc/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

export default function MetaPage() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState<string | null>(null);
  const utils = api.useUtils();
  const router = useRouter();
  const { toast } = useToast();

  const setToken = api.meta.setAccessToken.useMutation({
    onSuccess: async () => {
      await utils.user.invalidate();
      await utils.meta.invalidate();
      toast({
        variant: "default",
        title: "Dein Meta-Konto wurde erfolgreich Verknüpft",
      });
      router.push("/app");
    },
  });

  useEffect(() => {
    const authCode = searchParams.get("code");
    if (authCode) {
      setCode(authCode);
    }
  }, [searchParams]);

  return (
    <Suspense fallback={<p>Lade...</p>}>
      <MetaContent code={code} setToken={setToken} />
    </Suspense>
  );
}

function MetaContent({
  code,
  setToken,
}: {
  code: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setToken: any;
}) {
  return (
    <div className="my-10 flex flex-col items-center">
      <h1>Bitte bestätige deine Verknüpfung mit deinem Meta-Konto</h1>
      {code ? (
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        <Button onClick={() => setToken.mutate({ code })}>
          Verknüpfung bestätigen
        </Button>
      ) : (
        <p>No Authorization Code found.</p>
      )}
    </div>
  );
}
