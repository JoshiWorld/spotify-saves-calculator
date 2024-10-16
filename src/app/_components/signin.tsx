"use client";

import { Button } from "@/components/ui/button";
import { type BuiltInProviderType } from "next-auth/providers/index";
import {
  type ClientSafeProvider,
  type LiteralUnion,
  signIn,
} from "next-auth/react";

export function SignIn({
  providers,
}: {
  providers: Record<
    LiteralUnion<BuiltInProviderType, string>,
    ClientSafeProvider
  > | null;
}) {
  return (
    <>
      {/* @ts-expect-error || ignore */}
      {Object.values(providers).map((provider) => (
        <div key={provider.name}>
          <Button onClick={() => signIn(provider.id)}>
            Mit {provider.name} anmelden
          </Button>
        </div>
      ))}
    </>
  );
}
