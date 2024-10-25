import { getServerAuthSession } from "@/server/auth";
import { getProviders } from "next-auth/react";
import HomePage from "@/app/_components/home";
import { SignIn } from "@/app/_components/signin";

export default async function Home() {
  const session = await getServerAuthSession();
  const providers = await getProviders();

  return (
    <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
      <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
        Smart<span className="text-primary">Savvy</span>
      </h1>
      {session?.user ? <HomePage /> : <SignIn providers={providers} />}
    </div>
  );
}
