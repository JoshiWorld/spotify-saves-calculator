export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="container w-full py-8">{children}</div>;
}
