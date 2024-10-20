"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { PlayIcon } from "lucide-react";
import Image from "next/image";

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
  testEventCode: string | null;
};

type CustomerInfo = {
  client_user_agent: string;
  client_ip_address: string | null;
};

export function UserLink({ referer, link, clientIp, userAgent }: { referer: string, link: MinLink; clientIp: string; userAgent: string; }) {
  const customerInfo: CustomerInfo = {
    client_user_agent: userAgent,
    client_ip_address: clientIp,
  };

  return (
    <Card>
      <CardContent className="p-2">
        <div className="relative h-80 w-80 md:h-96 md:w-96">
          <Image
            src={link.image!}
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
  );
}

function StreamButton({ streamingLink, customerInfo, playLink, platform, link, referer }: { streamingLink: string; customerInfo: CustomerInfo; playLink: string; platform: string; link: MinLink; referer: string }) {
  const sendEvent = api.meta.conversionEvent.useMutation({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSuccess: (res) => {
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
        className="rounded border w-24 md:w-32 border-white font-extrabold"
        variant="ghost"
        disabled={sendEvent.isPending}
        onClick={() =>
          sendEvent.mutate({
            linkName: link.name,
            eventName: "SSC Link Click",
            eventId: "ssc-link-click",
            testEventCode: link.testEventCode!,
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
        {sendEvent.isPending ? "Playing.." : "PLAY"}
      </Button>
    </div>
  );
}