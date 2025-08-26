import { SidebarProvider } from "@/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container z-20 my-10 flex flex-col items-center justify-center p-5">
      <SidebarProvider>
        {children}
      </SidebarProvider>
    </div>
  );
}
