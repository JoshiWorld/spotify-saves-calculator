"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export default function Page() {
  return (
    <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
      <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
        Spotify <span className="text-primary">Saves</span> Calculator
      </h1>
      <Button onClick={() => signOut({ callbackUrl: "/" })}>Ausloggen</Button>
    </div>
  );
}
