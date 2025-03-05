import { FacebookPixel } from "@/app/_components/links/pixel";
import { UserLink } from "@/app/_components/links/user-link";
import { UserLinkGlow } from "@/app/_components/links/user-link-glow";
import { api } from "@/trpc/server";
import { cookies, headers } from "next/headers";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import { type Metadata } from "next";
import { SplittestVersion } from "@prisma/client";

type CountryCode = {
  countryCode: string;
};

type Props = {
  params: { name: string; artist: string };
  searchParams: Record<string, string | string[] | undefined>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name, artist } = params;
  try {
    const link = await api.link.getTitles({ name, artist });

    if (!link) {
      return {
        title: "Link nicht gefunden",
      };
    }

    return {
      title: `${link.songtitle} - ${link.artist}`,
      description: link.description ?? "Smartlink erstellt mit SmartSavvy",
    };
  } catch (error) {
    console.error("Fehler beim Abrufen der Link-Daten:", error);
    return {
      title: "Fehler beim Laden des Titels",
    };
  }
}

export default async function Page({ params, searchParams }: Props) {
  const name = params.name;
  const artist = params.artist;
  const link = await api.link.getByName({ name, artist });
  const search = searchParams;

  if (!link) return <p>Der Link existiert nicht.</p>;

  // const refererBackup = `${env.NEXTAUTH_URL}/link/${artist}/${name}`;
  const refererBackup = `https://smartsavvy.eu/link/${artist}/${name}`;
  // const referer = headers().get("referer") ?? refererBackup;
  const userAgent = headers().get("user-agent");

  // const xForwardedFor = headers().get("x-forwarded-for");

  // const getIP = (ipString: string | null) => {
  //   if (!ipString) return null;

  //   const ips = ipString.split(",").map((ip) => ip.trim());

  //   // IPv6-Regex (schließt "::" und "::1" ein)
  //   const ipv6Regex = /([a-fA-F0-9]{1,4}:){1,7}[a-fA-F0-9]{1,4}/;
  //   for (const ip of ips) {
  //     if (ipv6Regex.test(ip)) {
  //       return ip; // IPv6 gefunden → direkt zurückgeben
  //     }
  //   }

  //   // Falls keine IPv6 gefunden wurde, auf IPv4 zurückgreifen
  //   const ipv4Regex = /(\d{1,3}\.){3}\d{1,3}/;
  //   for (const ip of ips) {
  //     const match = ipv4Regex.exec(ip);
  //     if (match) {
  //       return match[0];
  //     }
  //   }

  //   return null;
  // };

  function getIP() {
    const ip =
      headers().get("CF-Connecting-IP") ?? headers().get("X-Forwarded-For");
    // @ts-expect-error || @ts-ignore
    return ip ? ip.split(",")[0].trim() : null;
  }

  const clientIp = getIP() ?? headers().get("X-Forwarded-For");

  async function getCountryFromIP(ip: string) {
    try {
      const response = await fetch(
        `http://ip-api.com/json/${ip}?fields=countryCode`,
      );
      const data = (await response.json()) as CountryCode;
      return data.countryCode.toLowerCase() ?? null;
    } catch (error) {
      console.error("Geolocation API Fehler:", error);
      return null;
    }
  }

  const country = clientIp ? await getCountryFromIP(clientIp) : null;

  // const fbp = cookies().get("_fbp")?.value ?? null;
  // const timestamp = Math.floor(Date.now() / 1000);
  const timestamp = Date.now();
  const randomNr = Math.floor(Math.random() * 9e17 + 1e17).toString();
  const fbp = cookies().get("_fbp")?.value ?? `fb.1.${timestamp}.${randomNr}`;
  const fbc = search.fbclid?.toString()
    ? `fb.1.${timestamp}.${search.fbclid?.toString()}`
    : (cookies().get("_fbc")?.value ?? null);
  const viewEventId = `event.visit.${uuidv4().replaceAll("-", "").slice(0, 8)}`;
  const clickEventId = `event.click.${uuidv4().replaceAll("-", "").slice(0, 8)}`;

  if (link.splittest) {
    let splittestVersion: SplittestVersion;

    switch (link.splittestVersion) {
      case SplittestVersion.DEFAULT:
        splittestVersion = SplittestVersion.GLOW;
        break;
      case SplittestVersion.GLOW:
        splittestVersion = SplittestVersion.DEFAULT;
        break;
      default:
        splittestVersion = SplittestVersion.DEFAULT;
        break;
    }

    await api.link.updateNextSplittest({
      id: link.id,
      splittestVersion: splittestVersion,
    });
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden pb-48 dark:bg-zinc-950 md:pb-0">
      <FacebookPixel
        pixelId={link.pixelId}
        ip={clientIp!}
        fbc={fbc!}
        fbp={fbp}
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
        {link.splittest ? (
          <>
            {link.splittestVersion === SplittestVersion.GLOW ? (
              <UserLinkGlow
                referer={refererBackup}
                link={link}
                clientIp={clientIp!}
                countryCode={country}
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
                countryCode={country}
                userAgent={userAgent!}
                fbp={fbp}
                fbc={fbc}
                viewEventId={viewEventId}
                clickEventId={clickEventId}
              />
            )}
          </>
        ) : (
          <>
            {link.glow ? (
              <UserLinkGlow
                referer={refererBackup}
                link={link}
                clientIp={clientIp!}
                countryCode={country}
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
                countryCode={country}
                userAgent={userAgent!}
                fbp={fbp}
                fbc={fbc}
                viewEventId={viewEventId}
                clickEventId={clickEventId}
              />
            )}
          </>
        )}
        <div className="flex items-center justify-center gap-5 md:mt-8">
          <a href="/impressum" className="text-zinc-400 hover:underline">
            Impressum
          </a>
          <a href="/privacy" className="text-zinc-400 hover:underline">
            Datenschutz
          </a>
        </div>
      </div>
    </div>
  );
}
