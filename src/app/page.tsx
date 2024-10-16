import { getServerAuthSession } from "@/server/auth";
import { HydrateClient } from "@/trpc/server";
import HomePage from "./_components/home";
import { getProviders } from "next-auth/react";
import { SignIn } from "./_components/signin";

export default async function Home() {
  const session = await getServerAuthSession();
  const providers = await getProviders();

  return (
    <HydrateClient>
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Spotify <span className="text-primary">Saves</span> Calculator
        </h1>
        {session?.user ? <HomePage /> : <SignIn providers={providers} />}
      </div>
    </HydrateClient>
  );
}
