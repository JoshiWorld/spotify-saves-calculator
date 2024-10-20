import { UserLink } from "@/app/_components/links/user-link";
import { FacebookPixelEvents } from "@/app/_components/meta/pixel";
import { env } from "@/env";
import { api } from "@/trpc/server";
import { headers } from "next/headers";
import Image from "next/image";
import { Suspense } from "react";

export default async function Page({ params }: { params: { name: string } }) {
  const name = params.name;
  void api.link.getByName.prefetch({ name });
  const link = await api.link.getByName({ name });

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
    },
    referer,
  });

  const { pixelId, ...withoutPixelId } = link;

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

        <UserLink
          link={withoutPixelId}
          referer={referer}
          userAgent={userAgent!}
          clientIp={clientIp!}
        />
      </div>

      <Suspense fallback={null}>
        <FacebookPixelEvents pixelId={pixelId} />
      </Suspense>
    </div>
  );
}
