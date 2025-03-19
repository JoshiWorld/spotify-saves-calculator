"use client";

import styles from "./styles.module.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/ui/loading";
import { getCookie, setCookie } from "@/hooks/cookie";
import { api } from "@/trpc/react";
import { type SplittestVersion } from "@prisma/client";
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
  testMode: boolean;
  splittestVersion: SplittestVersion | null;
  spotifyGlowColor: string | null;
  appleMusicGlowColor: string | null;
  itunesGlowColor: string | null;
  deezerGlowColor: string | null;
};

type CustomerInfo = {
  client_user_agent: string;
  client_ip_address: string;
  fbc: string | null;
  fbp: string | null;
  countryCode: string | null;
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
  const [clientIp, setClientIp] = useState<string>(clientIpServer ?? "127.0.0.1");
  const [isLoading, setIsLoading] = useState(true);
  const [pixelInit, setPixelInit] = useState(false);
  const sendPageView = api.meta.conversionEvent.useMutation();

  useEffect(() => {
    async function fetchIpv6() {
      setIsLoading(true);
      let ipv6Address: string | null = null;

      try {
        const res = await fetch("https://ipv6.icanhazip.com");
        if (!res.ok) {
          console.error("Fehler beim Fetchen der IPv6:", res.status);
          throw new Error(`Fehler beim Fetchen der IPv6: ${res.status}`);
        }

        ipv6Address = (await res.text()).trim();
      } catch (err) {
        console.error(err);
        ipv6Address = null;
      } finally {
        setIsLoading(false);
      }

      if(ipv6Address) {
        setClientIp(ipv6Address);
      }

      // @ts-expect-error || @ts-ignore
      if (!pixelInit || !window.__pixelInitialized) {
        setPixelInit(true);

        // @ts-expect-error || @ts-ignore
        window.__pixelInitialized = true;

        if (link.testMode || fbc) {
          if (getCookie(`${link.name}_visit`) && !link.testMode) return;

          const cookiePreference = getCookie("cookie_preference");

          if (link.testMode) {
            if (
              cookiePreference !== "accepted" &&
              cookiePreference !== "onlyNeeded"
            ) {
              return;
            }
          } else {
            setCookie(`${link.name}_visit`, "visited", 30);
          }

          // @ts-expect-error || @ts-ignore
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
            splittestVersion: link.splittestVersion,
            eventName: "SavvyLinkVisit",
            eventId: viewEventId,
            testEventCode: link.testEventCode,
            eventData: {
              content_category: "visit",
              content_name: link.name,
            },
            customerInfo: {
              client_ip_address: ipv6Address ?? clientIp,
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
    }

    void fetchIpv6();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if(isLoading) {
    <LoadingSkeleton />;
  }

  const customerInfo: CustomerInfo = {
    client_user_agent: userAgent,
    client_ip_address: clientIp,
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
  // const { cookiePreference } = useCookiePreference();

  const buttonClick = () => {
    const cookiePreference = getCookie("cookie_preference");

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
  let color = "";
  switch (platform) {
    case "apple_music":
      if (link.appleMusicGlowColor) {
        glowCss = `${styles.glow}`;
        color = link.appleMusicGlowColor;
      } else {
        glowCss =
          "shadow-redglow hover:bg-red-600 border-red-400 bg-red-500 hover:border-red-500 focus:border-red-500";
      }
      break;
    case "itunes":
      if (link.itunesGlowColor) {
        glowCss = `${styles.glow}`;
        color = link.itunesGlowColor;
      } else {
        glowCss =
          "shadow-redglow hover:bg-red-600 border-red-400 bg-red-500 hover:border-red-500 focus:border-red-500";
      }
      break;
    case "deezer":
      if (link.deezerGlowColor) {
        glowCss = `${styles.glow}`;
        color = link.deezerGlowColor;
      } else {
        glowCss =
          "shadow-yellowglow hover:bg-yellow-600 border-yellow-400 bg-yellow-500 hover:border-yellow-500 focus:border-yellow-500";
      }
      break;
    case "spotify":
      if(link.spotifyGlowColor) {
        glowCss = `${styles.glow}`;
        color = link.spotifyGlowColor;
      } else {
        glowCss =
          "shadow-greenglow hover:bg-green-600 border-green-400 bg-green-500 hover:border-green-500 focus:border-green-500";
      }
      break;
    default:
      color = "#22c55e";
      glowCss =
        "shadow-greenglow hover:bg-green-600 border-green-400 bg-green-500 hover:border-green-500 focus:border-green-500";
      break;
  }

  return (
    <div className="flex items-center justify-around py-4">
      <Button
        className={`${glowCss} h-auto w-full rounded border font-extrabold transition-all duration-300`}
        // @ts-expect-error || @ts-ignore
        style={{ "--glow-color": color }}
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
  // const { cookiePreference } = useCookiePreference();

  const buttonClick = () => {
    const cookiePreference = getCookie("cookie_preference");

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
