import { TopNavigator } from "../_components/nav";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
      <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
        Spotify <span className="text-primary">Saves</span> Calculator
      </h1>
      <TopNavigator />
      {children}
    </div>
  );
}
