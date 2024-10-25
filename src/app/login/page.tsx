import { Login } from "@/app/_components/landing/login";
import { type Metadata } from "next";
import { getProviders } from "next-auth/react";

export const metadata: Metadata = {
  title: "Login | SmartSavvy",
  description:
    "Hier kannst du dich bei SmartSavvy anmelden",
};

export default async function LoginPage() {
  const providers = await getProviders();

  return (
    <main>
      <Login providers={providers} />
    </main>
  );
}
