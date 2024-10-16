"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export default function Page() {
  return (
    <Button onClick={() => signOut({ callbackUrl: "/" })}>Ausloggen</Button>
  );
}
