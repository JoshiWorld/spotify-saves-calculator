import HomePage from "@/app/_components/home";
import { api } from "@/trpc/server";
import { Package } from "@prisma/client";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await api.user.get();
  if (!user?.admin || !user.package || user.package === Package.STARTER) {
    return redirect("/app/abo");
  }

  return (
    <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
      <HomePage />
    </div>
  );
}
