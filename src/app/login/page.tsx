import { Login } from "@/app/_components/landing/login";
import { getServerAuthSession } from "@/server/auth";
import { type Metadata } from "next";
import { getProviders } from "next-auth/react";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Login | SmartSavvy",
  description:
    "Hier kannst du dich bei SmartSavvy anmelden",
};

export default async function LoginPage() {
  const session = await getServerAuthSession();
  if(session?.user) return redirect('/app');

  const providers = await getProviders();

  return (
    <main>
      <Login providers={providers} />
    </main>
  );
}
