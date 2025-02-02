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
  client_ip_address: string;
  fbc: string | null;
  fbp: string | null;
};

// COOKIE LOGIC
const setCookie = (name: string, value: string, minutes: number) => {
  const date = new Date();
  date.setTime(date.getTime() + minutes * 60 * 1000);
  document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/; SameSite=Strict`;
};

const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return null;
};

export function UserLinkGlow({
  referer,
  link,
  clientIp,
  userAgent,
  fbp,
  fbc,
  viewEventId,
  clickEventId,
}: {
  referer: string;
  link: MinLink;
  clientIp: string;
  userAgent: string;
  fbp: string | null;
  fbc: string | null;
  viewEventId: string;
  clickEventId: string;
}) {
  const [pixelInit, setPixelInit] = useState(false);
  const sendPageView = api.meta.conversionEvent.useMutation();

  const customerInfo: CustomerInfo = {
    client_user_agent: userAgent,
    client_ip_address: clientIp,
    fbc,
    fbp,
  };

  useEffect(() => {
    // @ts-expect-error || IGNORE
    if (!pixelInit && !window.__pixelInitialized) {
      setPixelInit(true);

      // @ts-expect-error || IGNORE
      window.__pixelInitialized = true;

      if (getCookie(`${link.name}_visit`)) return;

      if (link.testEventCode || fbc) {
        // @ts-expect-error || IGNORE
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        window.fbq(
          "trackCustom",
          "SavvyLinkVisit",
          {
            content_name: link.name,
            content_category: "visit",
          },
          { eventID: viewEventId },
        );

        sendPageView.mutate({
          linkName: link.name,
          eventName: "SavvyLinkVisit",
          eventId: viewEventId,
          testEventCode: link.testEventCode,
          eventData: {
            content_category: "visit",
            content_name: link.name,
          },
          customerInfo: {
            client_ip_address: clientIp,
            client_user_agent: userAgent,
            fbc,
            fbp,
          },
          referer,
          event_time: Math.floor(new Date().getTime() / 1000),
        });

        setCookie(`${link.name}_visit`, "visited", 30);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card className="border-none dark:bg-zinc-950">
      <CardContent className="p-2">
        <div className="relative h-80 w-80 md:h-96 md:w-96">
          <Image
            src={link.image!}
            alt="Card Image"
            layout="fill"
            objectFit="cover"
            className="md:rounded-t"
            loading="eager"
            priority
          />
          {link.playbutton && (
            <PlayButton
              link={link}
              customerInfo={customerInfo}
              referer={referer}
              clickEventId={clickEventId}
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
              clickEventId={clickEventId}
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
              clickEventId={clickEventId}
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
              clickEventId={clickEventId}
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
              clickEventId={clickEventId}
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
              clickEventId={clickEventId}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function StreamButton({
  streamingLink,
  customerInfo,
  playLink,
  platform,
  link,
  referer,
  clickEventId,
}: {
  streamingLink: string;
  customerInfo: CustomerInfo;
  playLink: string;
  platform: string;
  link: MinLink;
  referer: string;
  clickEventId: string;
}) {
  const sendEvent = api.meta.conversionEvent.useMutation({
    onSuccess: () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      window.location.href = playLink;
    },
  });

  const buttonClick = () => {
    if ((link.testEventCode || customerInfo.fbc) && !getCookie(`${link.name}_click`)) {
      // @ts-expect-error || IGNORE
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      window.fbq(
        "trackCustom",
        "SavvyLinkClick",
        {
          content_name: platform,
          content_category: "click",
        },
        { eventID: clickEventId },
      );

      setCookie(`${link.name}_click`, "clicked", 30);

      sendEvent.mutate({
        linkName: link.name,
        eventName: "SavvyLinkClick",
        eventId: clickEventId,
        testEventCode: link.testEventCode,
        eventData: {
          content_category: "click",
          content_name: platform,
        },
        customerInfo,
        referer,
        event_time: Math.floor(new Date().getTime() / 1000),
      });
    } else {
      window.location.href = playLink;
    }
  };

  let glowCss = "";
  switch (platform) {
    case "apple_music":
    case "itunes":
      glowCss =
        "shadow-redglow h-auto w-full rounded border hover:bg-red-600 border-red-400 bg-red-500 font-extrabold transition-all duration-300 hover:border-red-500 focus:border-red-500";
      break;
    case "deezer":
      glowCss =
        "shadow-yellowglow h-auto w-full rounded border hover:bg-yellow-600 border-yellow-400 bg-yellow-500 font-extrabold transition-all duration-300 hover:border-yellow-500 focus:border-yellow-500";
      break;
    default:
      glowCss =
        "shadow-greenglow h-auto w-full rounded border hover:bg-green-600 border-green-400 bg-green-500 font-extrabold transition-all duration-300 hover:border-green-500 focus:border-green-500";
      break;
  }

  return (
    <div className="flex items-center justify-around py-4">
      <Button
        className={glowCss}
        disabled={sendEvent.isPending}
        onClick={buttonClick}
      >
        <div className="relative h-10 w-28">
          <Image
            src={streamingLink}
            alt={`${platform} Logo`}
            width={100}
            height={100}
            className={
              platform === "spotify" ? "brightness-0 invert-[100%] filter" : ""
            }
          />
        </div>
      </Button>
    </div>
  );
}

export function PlayButton({
  customerInfo,
  link,
  referer,
  clickEventId,
}: {
  customerInfo: CustomerInfo;
  link: MinLink;
  referer: string;
  clickEventId: string;
}) {
  const sendEvent = api.meta.conversionEvent.useMutation({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSuccess: () => {
      window.location.href = link.spotifyUri ?? "";
    },
  });

  const buttonClick = () => {
    if (
      (link.testEventCode || customerInfo.fbc) &&
      !getCookie(`${link.name}_click`)
    ) {
      // @ts-expect-error || IGNORE
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      window.fbq(
        "trackCustom",
        "SavvyLinkClick",
        {
          content_name: "cover",
          content_category: "click",
        },
        { eventID: clickEventId },
      );

      setCookie(`${link.name}_click`, "clicked", 30);

      sendEvent.mutate({
        linkName: link.name,
        eventName: "SavvyLinkClick",
        eventId: clickEventId,
        testEventCode: link.testEventCode,
        eventData: {
          content_category: "click",
          content_name: "cover",
        },
        customerInfo,
        referer,
        event_time: Math.floor(new Date().getTime() / 1000),
      });
    } else {
      window.location.href = link.spotifyUri ?? "";
    }
  };

  return (
    <button
      className="absolute inset-0 flex items-center justify-center"
      onClick={buttonClick}
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
