import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerAuthSession();
  if (!session?.user.admin) {
    return redirect("/app");
  }

  return (
    <div className="container z-20 my-20 flex flex-col items-center justify-center rounded-sm border border-white border-opacity-40 bg-zinc-950 bg-opacity-95 p-5 shadow-xl">
      {children}
    </div>
  );
}
