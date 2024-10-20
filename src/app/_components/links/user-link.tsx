"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/trpc/react";
import Image from "next/image";
import { useEffect, useState } from "react";

type MinLink = {
  name: string;
  description: string | null;
  image: string | null;
  title: string;
  spotifyUri: string | null;
  appleUri: string | null;
  deezerUri: string | null;
  itunesUri: string | null;
  napsterUri: string | null;
};

type CustomerInfo = {
  client_user_agent: string;
  client_ip_address: string | null;
};

export function UserLink({ name, referer }: { name: string; referer: string }) {
  const [link] = api.link.getByName.useSuspenseQuery({ name });
  const [clientIp, setClientIp] = useState<string | null>(null);
  const [clientUserAgent, setClientUserAgent] = useState<string>("");

  const sendEvent = api.meta.conversionEvent.useMutation();

  useEffect(() => {
    setClientUserAgent(navigator.userAgent);

    if(!clientIp) {
      void fetch("/api/get-ip")
        .then((res) => res.json())
        .then((data) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
          setClientIp(data.ip);

          sendEvent.mutate({
            linkName: link!.name,
            eventName: "SSC Link Visit",
            eventId: "ssc-link-visit",
            testEventCode: "TEST7963",
            eventData: {
              content_category: "visit",
              content_name: link!.name,
            },
            customerInfo: {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
              client_ip_address: data.ip,
              client_user_agent: navigator.userAgent,
            },
            referer,
          });
        });
    }
  }, [clientIp, link, referer, sendEvent]);

  const customerInfo: CustomerInfo = {
    client_user_agent: clientUserAgent,
    client_ip_address: clientIp,
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={link!.image!}
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
            {link?.title}
          </h1>
        </div>

        <Card>
          <CardContent className="p-2">
            <div className="relative h-80 w-80 md:h-96 md:w-96">
              <Image
                src={link!.image!}
                alt="Card Image"
                layout="fill"
                objectFit="cover"
                className="rounded-t-lg"
              />
            </div>
            <div className="p-4">
              {link?.spotifyUri && (
                <StreamButton
                  streamingLink="https://hypeddit.com/images/smartlink-spotify-dark-logo.png"
                  link={link}
                  customerInfo={customerInfo}
                  platform="spotify"
                  playLink={link.spotifyUri}
                  referer={referer}
                />
              )}
              {link?.appleUri && (
                <StreamButton
                  streamingLink="https://hypeddit.com/images/smartlink-imusic-dark-logo.png"
                  link={link}
                  platform="apple_music"
                  customerInfo={customerInfo}
                  playLink={link.appleUri}
                  referer={referer}
                />
              )}
              {link?.itunesUri && (
                <StreamButton
                  streamingLink="https://hypeddit.com/images/smartlink-itunes-dark-logo.png"
                  link={link}
                  platform="itunes"
                  playLink={link.itunesUri}
                  customerInfo={customerInfo}
                  referer={referer}
                />
              )}
              {link?.deezerUri && (
                <StreamButton
                  streamingLink="https://hypeddit.com/images/smartlink-deezer-dark-logo.png"
                  link={link}
                  platform="deezer"
                  playLink={link.deezerUri}
                  customerInfo={customerInfo}
                  referer={referer}
                />
              )}
              {link?.napsterUri && (
                <StreamButton
                  streamingLink="https://hypeddit.com/images/smartlink-napster-dark-logo.png"
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

function StreamButton({ streamingLink, customerInfo, playLink, platform, link, referer }: { streamingLink: string; customerInfo: CustomerInfo; playLink: string; platform: string; link: MinLink; referer: string }) {
  const sendEvent = api.meta.conversionEvent.useMutation({
    onSuccess: () => {
      window.location.href = playLink;
      // console.log('RESPONSE:', res);
    },
  });

  return (
    <div className="flex items-center justify-around py-4">
      <div className="relative h-10 w-28">
        <Image src={streamingLink} alt="Spotify Logo" fill />
      </div>
      <Button
        className="pt-2"
        disabled={sendEvent.isPending}
        onClick={() =>
          sendEvent.mutate({
            linkName: link.name,
            eventName: "SSC Link Click",
            eventId: "ssc-link-click",
            testEventCode: "TEST7963",
            eventData: {
              content_category: "click",
              content_name: platform,
            },
            // @ts-expect-error || always true
            customerInfo,
            referer,
          })
        }
      >
        {sendEvent.isPending ? "Playing.." : "Play"}
      </Button>
    </div>
  );
}