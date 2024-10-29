import { getServerAuthSession } from "@/server/auth";
import HomePage from "@/app/_components/home";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerAuthSession();
  if(!session?.user) return redirect('/login');

  return (
    <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
      <HomePage />
    </div>
  );
}
