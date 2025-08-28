export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="container z-20 my-20 flex flex-col items-center justify-center rounded-sm border border-white border-opacity-40 bg-zinc-950 bg-opacity-95 p-5 shadow-xl">
      {children}
    </div>
  );
}
