import { api } from "@/trpc/server";

export default async function HomePage() {
  await api.project.getAll.prefetch();
  await api.meta.getMetaAccounts.prefetch();

  return <p>DDD</p>;
}
