"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCookiePreference } from "@/contexts/CookiePreferenceContext";
import { api } from "@/trpc/react";
import { type SplittestVersion } from "@prisma/client";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";

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
  testMode: boolean;
  splittestVersion: SplittestVersion | null;
};

type CustomerInfo = {
  client_user_agent: string;
  client_ip_address: string;
  fbc: string | null;
  fbp: string | null;
  countryCode: string | null;
};

// COOKIE LOGIC
const setCookie = (name: string, value: string, minutes: number) => {
  const date = new Date();
  date.setTime(date.getTime() + minutes * 60 * 1000);
  document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/; SameSite=Strict`;
};

const getCookie = (name: string) => {
  if (typeof document === "undefined") return null; // Falls im Server-Umfeld, keine Cookies verfügbar
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return null;
};

export function UserLinkGlow({
  referer,
  link,
  clientIpServer,
  userAgent,
  fbp,
  fbc,
  viewEventId,
  clickEventId,
  countryCode,
}: {
  referer: string;
  link: MinLink;
  clientIpServer: string | null;
  userAgent: string;
  fbp: string | null;
  fbc: string | null;
  viewEventId: string;
  clickEventId: string;
  countryCode: string | null;
}) {
  const [pixelInit, setPixelInit] = useState(false);
  const [ipv6, setIpv6] = useState<string | null>(null);
  const sendPageView = api.meta.conversionEvent.useMutation();
  const { cookiePreference } = useCookiePreference();
  const clientIp = clientIpServer ?? "127.0.0.1";

  // useCallback für die asynchrone Funktion
  const initializePixel = useCallback(async () => {
    if (link.testMode) {
      if (
        cookiePreference !== "accepted" &&
        cookiePreference !== "onlyNeeded"
      ) {
        return;
      }
    }

    try {
      const res = await fetch("https://ipv6.icanhazip.com");
      const ip = await res.text();
      setIpv6(ip);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      if (!pixelInit && !(window as any).__pixelInitialized && ip) {
        setPixelInit(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
        (window as any).__pixelInitialized = true;

        if (link.testMode || fbc) {
          if (getCookie(`${link.name}_visit`) && !link.testMode) return;

          if (!link.testMode) {
            setCookie(`${link.name}_visit`, "visited", 30);
          }

          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
          (window as any).fbq(
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
            splittestVersion: link.splittestVersion,
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
              fbp: fbp ?? getCookie("_fbp") ?? null,
              countryCode,
            },
            referer,
            event_time: Math.floor(new Date().getTime() / 1000),
          });
        }
      }
    } catch (err) {
      console.log(err);
    }
  }, [
    link.testMode,
    cookiePreference,
    pixelInit,
    fbc,
    link.name,
    viewEventId,
    clientIp,
    userAgent,
    fbp,
    countryCode,
    referer,
    link.splittestVersion,
    link.testEventCode,
    sendPageView,
  ]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    initializePixel();
  }, [initializePixel]);

  function normalizeIp(ip: string): string {
    const ipv4Regex = /^(?:\d{1,3}\.){3}\d{1,3}$/;
    return ipv4Regex.test(ip) ? ipv6! : ip;
  }

  const customerInfo: CustomerInfo = {
    client_user_agent: userAgent,
    client_ip_address: normalizeIp(clientIp),
    fbc,
    fbp: fbp ?? getCookie("_fbp") ?? null,
    countryCode,
  };

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
  const { cookiePreference } = useCookiePreference();

  const buttonClick = () => {
    if (link.testMode) {
      if (
        cookiePreference !== "accepted" &&
        cookiePreference !== "onlyNeeded"
      ) {
        window.location.href = playLink;
        return;
      }
    }

    if (link.testMode || customerInfo.fbc) {
      if (getCookie(`${link.name}_click`) && !link.testMode) {
        window.location.href = playLink;
        return;
      }

      if (!link.testMode) {
        setCookie(`${link.name}_click`, "clicked", 30);
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      (window as any).fbq(
        "trackCustom",
        "SavvyLinkClick",
        {
          content_name: platform,
          content_category: "click",
        },
        { eventID: clickEventId },
      );

      sendEvent.mutate({
        linkName: link.name,
        splittestVersion: link.splittestVersion,
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
    onSuccess: () => {
      window.location.href = link.spotifyUri ?? "";
    },
  });
  const { cookiePreference } = useCookiePreference();

  const buttonClick = () => {
    if (link.testMode) {
      if (
        cookiePreference !== "accepted" &&
        cookiePreference !== "onlyNeeded"
      ) {
        window.location.href = link.spotifyUri ?? "";
        return;
      }
    }

    if (link.testMode || customerInfo.fbc) {
      if (getCookie(`${link.name}_click`) && !link.testMode) {
        window.location.href = link.spotifyUri ?? "";
        return;
      }

      if (!link.testMode) {
        setCookie(`${link.name}_click`, "clicked", 30);
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      (window as any).fbq(
        "trackCustom",
        "SavvyLinkClick",
        {
          content_name: "cover",
          content_category: "click",
        },
        { eventID: clickEventId },
      );

      sendEvent.mutate({
        linkName: link.name,
        splittestVersion: link.splittestVersion,
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
