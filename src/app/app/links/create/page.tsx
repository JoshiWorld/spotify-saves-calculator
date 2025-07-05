import { CreateLinkOverview } from "@/app/_components/app/links/create-link";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await api.user.get();
  if (!user?.admin && !user?.package) return redirect("/app/abo");

  return (
    <div className="container z-20 my-10 w-screen flex flex-col items-center justify-center p-5">
      <CreateLinkOverview />
    </div>
  );
}