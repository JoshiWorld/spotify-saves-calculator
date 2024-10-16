"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function Login() {
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState<string>("");

  return (
    <div className="w-2/3 space-y-6">
      <Label htmlFor="date">E-Mail</Label>
      <Input
        id="email"
        placeholder="E-Mail"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button
        type="submit"
        onClick={() => login.mutate({ email })}
        disabled={login.isPending}
      >
        {login.isPending ? "Du wirst eingeloggt.." : "Einloggen"}
      </Button>
    </div>
  );
}
