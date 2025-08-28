import { TopNavigator } from "@/app/_components/app/nav";
import { api } from "@/trpc/server";
import { Package } from "@prisma/client";
import { redirect } from "next/navigation";

export default async function SavesCalculatorLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const user = await api.user.get();
    if (user?.admin || user?.package === Package.ARTIST || user?.package === Package.LABEL) return children;

    return redirect("/app/abo");
}

// export default async function RootLayout({
//   children,
// }: Readonly<{ children: React.ReactNode }>) {
//   const user = await api.user.get();
//   if (!user?.admin && (!user?.package || user?.package === Package.STARTER)) {
//     return redirect("/app/abo");
//   }

//   return (
//     <div className="container z-20 my-20 flex flex-col items-center justify-center rounded-sm border border-black border-opacity-40 bg-zinc-50 bg-opacity-95 p-5 shadow-xl dark:border-white dark:border-opacity-40 dark:bg-zinc-950 dark:bg-opacity-95">
//       <TopNavigator />
//       {children}
//     </div>
//   );
// }
