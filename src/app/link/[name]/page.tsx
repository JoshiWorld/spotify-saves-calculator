import { FacebookPixel } from "@/app/_components/links/pixel";
import { UserLink } from "@/app/_components/links/user-link";
// import { Card, CardContent } from "@/components/ui/card";
import { env } from "@/env";
import { api } from "@/trpc/server";
import { cookies, headers } from "next/headers";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";

// type CustomerInfo = {
//   client_user_agent: string;
//   client_ip_address: string | null;
//   fbc: string | null;
// };

export default async function Page({
  params,
  searchParams,
}: {
  params: { name: string };
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const name = params.name;
  await api.link.getByName.prefetch({ name });
  const link = await api.link.getByName({ name });
  const search = await searchParams;

  if (!link) return <p>Der Link existiert nicht.</p>;

  const refererBackup = `${env.NEXTAUTH_URL}/link/${name}`;
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

  const fbp = cookies().get("_fbp")?.value ?? null;
  const fbc = search.fbclid?.toString() ?? null;
  const viewEventId = `event.visit.${uuidv4()}`;
  // const viewEventId = "link-visit";
  const clickEventId = `event.click.${uuidv4()}`;

  void api.meta.conversionEvent({
    linkName: link.name,
    eventName: "SSC Link Visit",
    eventId: viewEventId,
    testEventCode: link.testEventCode,
    eventData: {
      content_category: "visit",
      content_name: link.name,
    },
    customerInfo: {
      client_ip_address: clientIp!,
      client_user_agent: userAgent!,
      fbc,
      fbp,
    },
    referer,
  });

  // const customerInfo: CustomerInfo = {
  //   client_user_agent: userAgent!,
  //   client_ip_address: clientIp,
  //   fbc: search.fbclid?.toString() ?? null,
  // };

  return (
    <div className="relative h-screen w-screen overflow-hidden dark:bg-zinc-950">
      <FacebookPixel pixelId={link.pixelId} ip={clientIp!} fbc={fbc!} fbp={fbp!} />

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
        <UserLink
          referer={referer}
          link={link}
          clientIp={clientIp!}
          userAgent={userAgent!}
          fbp={fbp}
          viewEventId={viewEventId}
          clickEventId={clickEventId}
        />
      </div>
    </div>
  );
}
