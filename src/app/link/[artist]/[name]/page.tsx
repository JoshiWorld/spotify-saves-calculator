import { FacebookPixel } from "@/app/_components/links/pixel";
import { UserLink } from "@/app/_components/links/user-link";
import { UserLinkGlow } from "@/app/_components/links/user-link-glow";
import { api } from "@/trpc/server";
import { cookies, headers } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { type Metadata } from "next";
import { SplittestVersion } from "@prisma/client";
import { LinkBackgroundImage } from "@/app/_components/links/link-bg-image";

type CountryCode = {
  countryCode: string;
};

type Props = {
  name: string;
  artist: string;
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type PageProps = {
  params: Promise<Props>;
  searchParams: SearchParams;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { name, artist } = await params;
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


export default async function Page({ params, searchParams }: PageProps) {
  const { name, artist } = await params;
  const link = await api.link.getByName({ name, artist });
  const { fbclid } = await searchParams;

  if (!link?.image) return <p>Der Link existiert nicht.</p>;

  const refererBackup = `https://smartsavvy.eu/link/${artist}/${name}`;
  const headersList = await headers();
  const userAgent =
    headersList.get("user-agent") ??
    "Mozilla/5.0 (Linux; Android 14; SM-S928B Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/134.0.6998.39 Mobile Safari/537.36 Instagram 372.0.0.48.60 Android (34/14; 480dpi; 1080x2120; samsung; SM-S928B; e3q; qcom; de_DE; 709818009)";

  function getIP() {
    const ip =
      headersList.get("CF-Connecting-IP") ?? headersList.get("X-Forwarded-For");
    // @ts-expect-error || @ts-ignore
    return ip ? ip.split(",")[0].trim() : null;
  }

  const clientIp = getIP() ?? headersList.get("X-Forwarded-For");

  const country = clientIp ? await getCountryFromIP(clientIp) : null;
  const timestamp = Date.now();
  const randomNr = Math.floor(Math.random() * 9e17 + 1e17).toString();
  const cookiesList = await cookies();
  const fbp = cookiesList.get("_fbp")?.value ?? `fb.1.${timestamp}.${randomNr}`;
  const fbc = fbclid
    ? `fb.1.${timestamp}.${String(fbclid)}`
    : (cookiesList.get("_fbc")?.value ?? null);
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
      name: link.name,
    });
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden overflow-y-scroll pb-48 dark:bg-zinc-950 md:overflow-hidden md:pb-0">
      <FacebookPixel pixelId={link.pixelId} viewEventId={viewEventId} />

      <LinkBackgroundImage image={link.image} />

      <div className="relative flex h-full flex-col items-center justify-start md:justify-center">
        {link.splittest ? (
          <>
            {link.splittestVersion === SplittestVersion.GLOW ? (
              <UserLinkGlow
                referer={refererBackup}
                link={link}
                clientIpServer={clientIp}
                countryCode={country}
                userAgent={userAgent}
                fbp={fbp}
                fbc={fbc}
                viewEventId={viewEventId}
                clickEventId={clickEventId}
              />
            ) : (
              <UserLink
                referer={refererBackup}
                link={link}
                clientIpServer={clientIp}
                countryCode={country}
                userAgent={userAgent}
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
                clientIpServer={clientIp}
                countryCode={country}
                userAgent={userAgent}
                fbp={fbp}
                fbc={fbc}
                viewEventId={viewEventId}
                clickEventId={clickEventId}
              />
            ) : (
              <UserLink
                referer={refererBackup}
                link={link}
                clientIpServer={clientIp}
                countryCode={country}
                userAgent={userAgent}
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

async function getCountryFromIP(ip: string) {
  try {
    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=countryCode`,
    );
    const data = (await response.json()) as CountryCode;
    const code = data.countryCode ? data.countryCode.toLowerCase() : null;
    return code;
  } catch (error) {
    console.error("Geolocation API Fehler:", error);
    return null;
  }
}
