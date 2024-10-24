"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/trpc/react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ReactPixel from "react-facebook-pixel";

type MinLink = {
  name: string;
  description: string | null;
  image: string | null;
  artist: string;
  songtitle: string;
  spotifyUri: string | null;
  appleUri: string | null;
  deezerUri: string | null;
  itunesUri: string | null;
  napsterUri: string | null;
  testEventCode: string | null;
  pixelId: string;
  playbutton: boolean;
};

type CustomerInfo = {
  client_user_agent: string;
  client_ip_address: string | null;
  fbc: string | null;
};

export function UserLink({ referer, link, clientIp, userAgent }: { referer: string, link: MinLink; clientIp: string; userAgent: string; }) {
  const [pixelInit, setPixelInit] = useState(false);
  const searchParams = useSearchParams();
  const fbc = searchParams.get('fbclid');

  const customerInfo: CustomerInfo = {
    client_user_agent: userAgent,
    client_ip_address: clientIp,
    fbc
  };

  useEffect(() => {
    // @ts-expect-error || IGNORE
    if (!pixelInit && !window.__pixelInitialized) {
      setPixelInit(true);
      // @ts-expect-error || IGNORE
      window.__pixelInitialized = true;
      // Facebook Pixel initialisieren
      // ReactPixel.init(link.pixelId, {  }, { autoConfig: true, debug: true });
      ReactPixel.init(link.pixelId);
      // ReactPixel.pageView(); // Seitenaufruf tracken
      ReactPixel.trackCustom("SSC Link Visit");
    }
  }, [link.pixelId, pixelInit]);

  return (
    <Card className="border-none bg-background">
      <CardContent className="p-2">
        <div className="relative h-80 w-80 md:h-96 md:w-96">
          <Image
            src={link.image!}
            alt="Card Image"
            layout="fill"
            objectFit="cover"
            className="md:rounded-t"
          />
          {link.playbutton && (
            <PlayButton
              link={link}
              customerInfo={customerInfo}
              referer={referer}
            />
          )}
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
  );
}

export function StreamButton({ streamingLink, customerInfo, playLink, platform, link, referer }: { streamingLink: string; customerInfo: CustomerInfo; playLink: string; platform: string; link: MinLink; referer: string }) {
  const sendEvent = api.meta.conversionEvent.useMutation({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSuccess: (res) => {
      ReactPixel.trackCustom("SSC Link Click");
      window.location.href = playLink;
      // console.log("Playlink:", playLink);
      // console.log('RESPONSE:', res);
      // console.log('CustomerInfo', customerInfo);
    },
  });

  return (
    <div className="flex items-center justify-around border-t border-t-gray-400 py-4">
      <div className="relative h-10 w-28">
        <Image
          src={streamingLink}
          alt={`${platform} Logo`}
          width={100}
          height={100}
        />
      </div>
      <Button
        className="w-24 rounded border border-white font-extrabold md:w-32"
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

export function PlayButton({
  customerInfo,
  link,
  referer,
}: {
  customerInfo: CustomerInfo;
  link: MinLink;
  referer: string;
}) {
  const sendEvent = api.meta.conversionEvent.useMutation({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSuccess: (res) => {
      // window.open(link.spotifyUri ?? "", "_blank");
      window.location.href = link.spotifyUri ?? "";
    },
  });

  return (
    <button
      onClick={() =>
        sendEvent.mutate({
          linkName: link.name,
          eventName: "SSC Link Click",
          eventId: "ssc-link-click",
          testEventCode: link.testEventCode!,
          eventData: {
            content_category: "click",
            content_name: "playbutton",
          },
          // @ts-expect-error || always true
          customerInfo,
          referer,
        })
      }
      className="absolute inset-0 flex items-center justify-center"
    >
      <div className="rounded-full bg-black bg-opacity-50 p-3 hover:bg-opacity-70">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="white"
          viewBox="0 0 24 24"
          width="48"
          height="48"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    </button>
  );
}