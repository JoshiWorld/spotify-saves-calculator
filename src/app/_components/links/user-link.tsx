"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/ui/loading";
import { getCookie, setCookie } from "@/hooks/cookie";
import { api } from "@/trpc/react";
import { type SplittestVersion } from "@prisma/client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getSpotifyDeeplink } from "./deeplink";

type IPQuery = {
  status?: string;
  country?: string;
  countryCode?: string;
  region?: string;
  regionName?: string;
  city?: string;
  zip?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  isp?: string;
  org?: string;
  as?: string;
  query?: string;
};

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
  ct: string | null;
  st: string | null;
  zp: string | null;
  country: string | null;
  external_id: string | null;
};

export function UserLink({
  referer,
  link,
  clientIpServer,
  userAgent,
  fbc,
  viewEventId,
  clickEventId,
  ipQueryData,
}: {
  referer: string;
  link: MinLink;
  clientIpServer: string | null;
  userAgent: string;
  fbc: string | null;
  viewEventId: string;
  clickEventId: string;
  ipQueryData: IPQuery | null;
}) {
  const [clientIp, setClientIp] = useState<string>(
    clientIpServer ?? "127.0.0.1",
  );
  const [pixelInit, setPixelInit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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

      if (ipv6Address) {
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
              fbp: getCookie("_fbp") ?? null,
              ct: ipQueryData?.city ?? null,
              st: ipQueryData?.region ?? null,
              zp: ipQueryData?.zip ?? null,
              country: ipQueryData?.countryCode ?? null,
              external_id: getCookie("anonymous_id") ?? null,
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

  if (isLoading) {
    <LoadingSkeleton />;
  }

  const customerInfo: CustomerInfo = {
    client_user_agent: userAgent,
    client_ip_address: clientIp,
    fbc,
    fbp: getCookie("_fbp") ?? null,
    ct: ipQueryData?.city ?? null,
    st: ipQueryData?.region ?? null,
    zp: ipQueryData?.zip ?? null,
    country: ipQueryData?.countryCode ?? null,
    external_id: getCookie("anonymous_id") ?? null,
  };

  return (
    <Card className="border-none bg-zinc-950">
      <CardContent className="p-2">
        <div className="relative mt-5 h-80 w-80 overflow-hidden md:mt-0 md:h-96 md:w-96">
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
              playLink={getSpotifyDeeplink(link.spotifyUri) ?? link.spotifyUri}
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
      const opened = window.open(playLink, "_blank");
      if (!opened) {
        window.location.href = playLink;
      }
    },
  });

  const buttonClick = () => {
    const cookiePreference = getCookie("cookie_preference");

    if (link.testMode) {
      if (
        cookiePreference !== "accepted" &&
        cookiePreference !== "onlyNeeded"
      ) {
        const opened = window.open(playLink, "_blank");
        if (!opened) {
          window.location.href = playLink;
        }
        return;
      }
    }

    if (link.testMode || customerInfo.fbc) {
      if (getCookie(`${link.name}_click`) && !link.testMode) {
        const opened = window.open(playLink, "_blank");
        if (!opened) {
          window.location.href = playLink;
        }
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
      const opened = window.open(playLink, "_blank");
      if (!opened) {
        window.location.href = playLink;
      }
    }
  };

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
        onClick={buttonClick}
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
