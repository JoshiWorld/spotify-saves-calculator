import { getServerAuthSession } from "@/server/auth";
import { NavbarLoggedIn } from "../_components/navbar";
import { Footer } from "@/app/_components/footer";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerAuthSession();

  return (
    <>
      {session?.user && <NavbarLoggedIn />}
      <main className="flex flex-col items-center justify-center bg-background">
        {children}
      </main>
      <Footer />
    </>
  );
}
