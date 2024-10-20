import { UserLink } from "@/app/_components/links/user-link";
import { env } from "@/env";
import { api } from "@/trpc/server";
import { headers } from "next/headers";
import Image from "next/image";

export default async function Page({
  params,
}: {
  params: { name: string };
}) {
  const name = params.name;
  void api.link.getByName.prefetch({ name });
  const link = await api.link.getByName({ name });

  if (!link) return <p>Der Link existiert nicht.</p>;

  const refererBackup = env.NODE_ENV !== "production" ? `http://localhost:3000/link/${name}` : `https://ssc.brokoly.de/link/${name}`
  const referer = headers().get("referer") ?? refererBackup;

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={link.image!}
          alt="Background"
          fill
          objectFit="cover"
          className="blur-md"
          priority={true}
        />
      </div>

      <div className="relative flex h-full flex-col items-center justify-center">
        <div className="pb-5">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            {link.title}
          </h1>
        </div>

        <UserLink link={link} referer={referer} />
      </div>
    </div>
  );
}
