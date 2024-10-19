"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/trpc/react";
import Image from "next/image";

const customerInfo = {
  email: "user@example.com",
  phone: "+1234567890",
};

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

export function UserLink({ name, referer }: { name: string; referer: string }) {
  const [link] = api.link.getByName.useSuspenseQuery({ name });

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
                  playLink={link.spotifyUri}
                  referer={referer}
                />
              )}
              {link?.appleUri && (
                <StreamButton
                  streamingLink="https://hypeddit.com/images/smartlink-imusic-dark-logo.png"
                  link={link}
                  playLink={link.appleUri}
                  referer={referer}
                />
              )}
              {link?.itunesUri && (
                <StreamButton
                  streamingLink="https://hypeddit.com/images/smartlink-itunes-dark-logo.png"
                  link={link}
                  playLink={link.itunesUri}
                  referer={referer}
                />
              )}
              {link?.deezerUri && (
                <StreamButton
                  streamingLink="https://hypeddit.com/images/smartlink-deezer-dark-logo.png"
                  link={link}
                  playLink={link.deezerUri}
                  referer={referer}
                />
              )}
              {link?.napsterUri && (
                <StreamButton
                  streamingLink="https://hypeddit.com/images/smartlink-napster-dark-logo.png"
                  link={link}
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

function StreamButton({ streamingLink, playLink, link, referer }: { streamingLink: string; playLink: string; link: MinLink; referer: string }) {
  const sendEvent = api.meta.conversionEvent.useMutation({
    onSuccess: () => {
      window.location.href = playLink;
    },
  });

  return (
    <div className="flex justify-around py-4 items-center">
      <div className="relative h-10 w-28">
        <Image
          src={streamingLink}
          alt="Spotify Logo"
          fill
        />
      </div>
      <Button
        className="pt-2"
        disabled={sendEvent.isPending}
        onClick={() =>
          sendEvent.mutate({
            linkName: link.name,
            eventName: "SSC Link Click",
            testEventCode: "ssc-link-click",
            eventData: {
              content_category: "click",
              content_name: "spotify",
            },
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