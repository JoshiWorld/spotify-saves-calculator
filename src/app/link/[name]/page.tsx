import { UserLink } from "@/app/_components/links/user-link";
import { env } from "@/env";
import { api } from "@/trpc/server";
import { headers } from "next/headers";

export default async function Page({
  params,
}: {
  params: { name: string };
}) {
  const name = params.name;
  const link = await api.link.getByName({ name });

  if (!link) return <p>Der Link existiert nicht.</p>;

  void api.link.getByName.prefetch({ name });

  const refererBackup = env.NODE_ENV !== "production" ? `http://localhost:3000/link/${name}` : `https://ssc.brokoly.de/link/${name}`
  const referer = headers().get("referer") ?? refererBackup;

  return <UserLink name={name} referer={referer} />;
}
