import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default async function RootLayout({
    children,
    header,
}: Readonly<{
    children: React.ReactNode;
    header: React.ReactNode;
}>) {
    const session = await getServerAuthSession();
    if (!session?.user) return redirect("/login");

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                {header}
                {children}
            </SidebarInset>
        </SidebarProvider>
    )
}