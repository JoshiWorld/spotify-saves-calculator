import { AdminSidebar } from "@/app/_components/admin/sidebar";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";

export default async function Page() {
    const user = await api.user.get();
    if(!user?.admin) redirect('/app');

    return (
      <div className="py-8 w-full">
        <AdminSidebar />
      </div>
    );
}