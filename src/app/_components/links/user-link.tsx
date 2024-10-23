"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/trpc/react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
// import ReactPixel from "react-facebook-pixel";

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
  pixelId: string;
};

type CustomerInfo = {
  client_user_agent: string;
  client_ip_address: string | null;
  fbc: string | null;
};

export function UserLink({ referer, link, clientIp, userAgent }: { referer: string, link: MinLink; clientIp: string; userAgent: string; }) {
  // const [pixelInit, setPixelInit] = useState(false);
  const searchParams = useSearchParams();
  const fbc = searchParams.get('fbclid');

  const customerInfo: CustomerInfo = {
    client_user_agent: userAgent,
    client_ip_address: clientIp,
    fbc
  };

  // useEffect(() => {
  //   // @ts-expect-error || IGNORE
  //   if (!pixelInit && !window.__pixelInitialized) {
  //     setPixelInit(true);
  //     // @ts-expect-error || IGNORE
  //     window.__pixelInitialized = true;
  //     // Facebook Pixel initialisieren
  //     // ReactPixel.init(link.pixelId, {  }, { autoConfig: true, debug: true });
  //     ReactPixel.init(link.pixelId);
  //     // ReactPixel.pageView(); // Seitenaufruf tracken
  //     // ReactPixel.trackCustom("SSC-Pixel Page View");
  //   }
  // }, [link.pixelId, pixelInit]);

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
            // placeholder="blur"
          />
        </div>
        <div className="p-4">
          <div className="pb-5">
            <h1 className="scroll-m-20 font-extrabold tracking-tight">
              {link.title}
            </h1>
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

function StreamButton({ streamingLink, customerInfo, playLink, platform, link, referer }: { streamingLink: string; customerInfo: CustomerInfo; playLink: string; platform: string; link: MinLink; referer: string }) {
  const sendEvent = api.meta.conversionEvent.useMutation({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSuccess: (res) => {
      // ReactPixel.trackCustom("SSC-Pixel Link Click");
      window.location.href = playLink;
      // console.log("Playlink:", playLink);
      // console.log('RESPONSE:', res);
      // console.log('CustomerInfo', customerInfo);
    },
  });

  return (
    <div className="flex items-center justify-around border-t border-t-gray-400 py-4">
      <div
        className={
          platform === "deezer" ? "relative h-8 w-28" : "relative h-10 w-28"
        }
      >
        <Image src={streamingLink} alt="Spotify Logo" fill />
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