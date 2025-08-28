"use client";

import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import styles from "../../links/styles.module.css";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

type LinkValues = {
    playbutton: boolean;
    artist: string | null;
    songtitle: string | null;
    spotifyUri: string | null;
    appleUri: string | null;
    itunesUri: string | null;
    deezerUri: string | null;
    napsterUri: string | null;
    appleMusicGlowColor: string | null;
    itunesGlowColor: string | null;
    deezerGlowColor: string | null;
    spotifyGlowColor: string | null;
}

export function GlowStylePreview({ link, image }: { link: LinkValues; image: string }) {
    return (
        <div className="relative h-full w-full overflow-hidden overflow-y-scroll dark:bg-zinc-950 md:overflow-hidden md:pb-0 border rounded-sm">
            <LinkBackgroundImage image={image} />

            <div className="relative flex h-full flex-col items-center justify-start md:my-10">
                <Card className="border-none bg-zinc-950">
                    <CardContent className="p-2">
                        <div className="relative mt-5 h-80 w-80 overflow-hidden md:mt-0 md:h-96 md:w-96">
                            <Image
                                src={image}
                                alt="Card Image"
                                layout="fill"
                                objectFit="cover"
                                objectPosition="top"
                                className="md:rounded-t"
                                loading="eager"
                                priority
                            />
                            {link.playbutton && (
                                <PlayButton />
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
                                <StreamButtonGlow
                                    streamingLink="/images/smartlink-spotify-dark-logo.png"
                                    platform="spotify"
                                    link={link}
                                />
                            )}
                            {link?.appleUri && (
                                <StreamButtonGlow
                                    streamingLink="/images/smartlink-imusic-dark-logo.png"
                                    platform="apple_music"
                                    link={link}
                                />
                            )}
                            {link?.itunesUri && (
                                <StreamButtonGlow
                                    streamingLink="/images/smartlink-itunes-dark-logo.png"
                                    platform="itunes"
                                    link={link}
                                />
                            )}
                            {link?.deezerUri && (
                                <StreamButtonGlow
                                    streamingLink="/images/smartlink-deezer-dark-logo.png"
                                    platform="deezer"
                                    link={link}
                                />
                            )}
                            {link?.napsterUri && (
                                <StreamButtonGlow
                                    streamingLink="/images/smartlink-napster-dark-logo.png"
                                    platform="napster"
                                    link={link}
                                />
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export function NormalStylePreview({ link, image }: { link: LinkValues; image: string }) {
    return (
        <div className="relative h-full w-full overflow-hidden overflow-y-scroll dark:bg-zinc-950 md:overflow-hidden md:pb-0 border rounded-sm">
            <LinkBackgroundImage image={image} />

            <div className="relative flex h-full flex-col items-center justify-start md:my-10">
                <Card className="border-none bg-zinc-950">
                    <CardContent className="p-2">
                        <div className="relative mt-5 h-80 w-80 overflow-hidden md:mt-0 md:h-96 md:w-96">
                            <Image
                                src={image}
                                alt="Card Image"
                                layout="fill"
                                objectFit="cover"
                                objectPosition="top"
                                className="md:rounded-t"
                                loading="eager"
                                priority
                            />
                            {link.playbutton && (
                                <PlayButton />
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
                                <StreamButtonNormal
                                    streamingLink="/images/smartlink-spotify-dark-logo.png"
                                    platform="spotify"
                                />
                            )}
                            {link?.appleUri && (
                                <StreamButtonNormal
                                    streamingLink="/images/smartlink-imusic-dark-logo.png"
                                    platform="apple_music"
                                />
                            )}
                            {link?.itunesUri && (
                                <StreamButtonNormal
                                    streamingLink="/images/smartlink-itunes-dark-logo.png"
                                    platform="itunes"
                                />
                            )}
                            {link?.deezerUri && (
                                <StreamButtonNormal
                                    streamingLink="/images/smartlink-deezer-dark-logo.png"
                                    platform="deezer"
                                />
                            )}
                            {link?.napsterUri && (
                                <StreamButtonNormal
                                    streamingLink="/images/smartlink-napster-dark-logo.png"
                                    platform="napster"
                                />
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function PlayButton() {
    return (
        <button
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

function StreamButtonGlow({ streamingLink, platform, link }: { streamingLink: string; platform: string; link: LinkValues }) {
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
          >
            <div className="relative h-10 w-28">
              <Image
                src={streamingLink}
                alt={`${platform} Logo`}
                width={100}
                height={100}
                className={
                  platform === "spotify" ? "brightness-0 invert-100 filter" : ""
                }
              />
            </div>
          </Button>
        </div>
      );
}

function StreamButtonNormal({ streamingLink, platform }: { streamingLink: string; platform: string }) {
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
          >
            PLAY
          </Button>
        </div>
      );
}

export function LinkBackgroundImage({ image }: { image: string }) {
    return (
      <div className="absolute inset-0 hidden md:block">
        <DynamicImage
          src={image}
          alt="Background"
          fill
          objectFit="cover"
          className="blur-md border rounded-sm"
          priority
        />
      </div>
    );
}

const DynamicImage = dynamic(() => import("next/image"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});