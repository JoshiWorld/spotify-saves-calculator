import { FacebookPixel } from "@/app/_components/links/pixel";
import { UserLink } from "@/app/_components/links/user-link";
import { UserLinkGlow } from "@/app/_components/links/user-link-glow";
import { api } from "@/trpc/server";
import { cookies, headers } from "next/headers";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";

export default async function Page({
  params,
  searchParams,
}: {
  params: { name: string; artist: string };
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const name = params.name;
  const artist = params.artist;
  const link = await api.link.getByName({ name, artist });
  const search = await searchParams;

  if (!link) return <p>Der Link existiert nicht.</p>;

  // const refererBackup = `${env.NEXTAUTH_URL}/link/${artist}/${name}`;
  const refererBackup = `https://smartsavvy.eu/link/${artist}/${name}`;
  // const referer = headers().get("referer") ?? refererBackup;
  const userAgent = headers().get("user-agent");

  const xForwardedFor = headers().get("x-forwarded-for");

  const getIP = (ipString: string | null) => {
    if (!ipString) return null;

    const ips = ipString.split(",").map((ip) => ip.trim());

    // IPv6-Regex (schließt "::" und "::1" ein)
    const ipv6Regex = /([a-fA-F0-9]{1,4}:){1,7}[a-fA-F0-9]{1,4}/;
    for (const ip of ips) {
      if (ipv6Regex.test(ip)) {
        return ip; // IPv6 gefunden → direkt zurückgeben
      }
    }

    // Falls keine IPv6 gefunden wurde, auf IPv4 zurückgreifen
    const ipv4Regex = /(\d{1,3}\.){3}\d{1,3}/;
    for (const ip of ips) {
      const match = ipv4Regex.exec(ip);
      if (match) {
        return match[0];
      }
    }

    return null;
  };

  const clientIp = getIP(xForwardedFor) ?? headers().get("x-forwarded-for");

  const fbp = cookies().get("_fbp")?.value ?? null;
  const timestamp = Math.floor(Date.now() / 1000);
  const fbc = search.fbclid?.toString()
    ? `fb.1.${timestamp}.${search.fbclid?.toString()}`
    : (cookies().get("_fbc")?.value ?? null);
  const viewEventId = `event.visit.${uuidv4().replaceAll("-", "").slice(0, 8)}`;
  const clickEventId = `event.click.${uuidv4().replaceAll("-", "").slice(0, 8)}`;

  return (
    <div className="relative h-screen w-screen overflow-hidden pb-48 dark:bg-zinc-950 md:pb-0">
      <FacebookPixel
        pixelId={link.pixelId}
        ip={clientIp!}
        fbc={fbc!}
        fbp={fbp!}
        viewEventId={viewEventId}
      />

      <div className="absolute inset-0 hidden md:block">
        <Image
          src={link.image!}
          alt="Background"
          fill
          objectFit="cover"
          className="blur-md"
        />
      </div>

      <div className="relative flex h-full flex-col items-center justify-center">
        {link.glow ? (
          <UserLinkGlow
            referer={refererBackup}
            link={link}
            clientIp={clientIp!}
            userAgent={userAgent!}
            fbp={fbp}
            fbc={fbc}
            viewEventId={viewEventId}
            clickEventId={clickEventId}
          />
        ) : (
          <UserLink
            referer={refererBackup}
            link={link}
            clientIp={clientIp!}
            userAgent={userAgent!}
            fbp={fbp}
            fbc={fbc}
            viewEventId={viewEventId}
            clickEventId={clickEventId}
          />
        )}
      </div>
    </div>
  );
}
