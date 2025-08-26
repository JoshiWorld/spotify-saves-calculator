import { api } from "@/trpc/server";
import { Package } from "@prisma/client";
import { redirect } from "next/navigation";

export default async function SmartlinksLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const user = await api.user.get();
    if (user?.admin || user?.package === Package.ARTIST || user?.package === Package.LABEL || user?.package === Package.STARTER) return children;

    return redirect("/app/abo");
}