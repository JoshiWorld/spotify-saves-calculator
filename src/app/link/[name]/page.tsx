import { PlayButton, StreamButton } from "@/app/_components/links/user-link";
import { Card, CardContent } from "@/components/ui/card";
import { env } from "@/env";
import { api } from "@/trpc/server";
import { headers } from "next/headers";
import Image from "next/image";

type CustomerInfo = {
  client_user_agent: string;
  client_ip_address: string | null;
  fbc: string | null;
};

export default async function Page({
  params,
  searchParams,
}: {
  params: { name: string };
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const name = params.name;
  void api.link.getByName.prefetch({ name });
  const link = await api.link.getByName({ name });
  const search = await searchParams;

  if (!link) return <p>Der Link existiert nicht.</p>;

  const refererBackup =
    env.NODE_ENV !== "production"
      ? `http://localhost:3000/link/${name}`
      : `https://ssc.brokoly.de/link/${name}`;
  const referer = headers().get("referer") ?? refererBackup;
  const userAgent = headers().get("user-agent");

  const xForwardedFor = headers().get("x-forwarded-for");

  const getIPv4 = (ipString: string | null) => {
    if (!ipString) return null;

    // Split by commas in case there are multiple IPs
    const ips = ipString.split(",");

    // Use regex to find the first IPv4
    const ipv4Regex = /(\d{1,3}\.){3}\d{1,3}/;
    for (const ip of ips) {
      const match = ipv4Regex.exec(ip.trim());
      if (match) {
        return match[0];
      }
    }

    return null;
  };

  const clientIp =
    // headers().get("x-forwarded-for") ?? headers().get("x-real-ip");
    getIPv4(xForwardedFor) ?? headers().get("x-forwarded-for");

  void api.meta.conversionEvent({
    linkName: link.name,
    eventName: "SSC Link Visit",
    eventId: "ssc-link-visit",
    testEventCode: link.testEventCode,
    eventData: {
      content_category: "visit",
      content_name: link.name,
    },
    customerInfo: {
      client_ip_address: clientIp!,
      client_user_agent: userAgent!,
      fbc: search.fbclid?.toString() ?? null,
    },
    referer,
  });

  const customerInfo: CustomerInfo = {
    client_user_agent: userAgent!,
    client_ip_address: clientIp,
    fbc: search.fbclid?.toString() ?? null,
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <div className="absolute inset-0 md:block hidden">
        <Image
          src={link.image!}
          alt="Background"
          fill
          objectFit="cover"
          className="blur-md"
        />
      </div>

      <div className="relative flex h-full flex-col items-center justify-center">
        <Card className="bg-background border-none">
          <CardContent className="p-2">
            <div className="relative h-80 w-80 md:h-96 md:w-96">
              <Image
                src={link.image!}
                alt="Card Image"
                layout="fill"
                objectFit="cover"
                className="md:rounded-t"
              />
              <PlayButton link={link} customerInfo={customerInfo} referer={referer} />
            </div>
            <div className="p-4">
              <div className="pb-5">
                <h1 className="scroll-m-20 font-extrabold tracking-tight">
                  {link.artist}
                </h1>
                <p>{link.songtitle}</p>
              </div>
              {link?.spotifyUri && (
                <StreamButton
                  streamingLink="/images/smartlink-spotify-dark-logo.png"
                  link={link}
                  customerInfo={customerInfo}
                  platform="spotify"
                  playLink={link.spotifyUri}
                  referer={referer}
                />
              )}
              {link?.appleUri && (
                <StreamButton
                  streamingLink="/images/smartlink-imusic-dark-logo.png"
                  link={link}
                  platform="apple_music"
                  customerInfo={customerInfo}
                  playLink={link.appleUri}
                  referer={referer}
                />
              )}
              {link?.itunesUri && (
                <StreamButton
                  streamingLink="/images/smartlink-itunes-dark-logo.png"
                  link={link}
                  platform="itunes"
                  playLink={link.itunesUri}
                  customerInfo={customerInfo}
                  referer={referer}
                />
              )}
              {link?.deezerUri && (
                <StreamButton
                  streamingLink="/images/smartlink-deezer-dark-logo.png"
                  link={link}
                  platform="deezer"
                  playLink={link.deezerUri}
                  customerInfo={customerInfo}
                  referer={referer}
                />
              )}
              {link?.napsterUri && (
                <StreamButton
                  streamingLink="/images/smartlink-napster-dark-logo.png"
                  link={link}
                  platform="napster"
                  customerInfo={customerInfo}
                  playLink={link.napsterUri}
                  referer={referer}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
