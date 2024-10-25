"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { IconBrandGoogle } from "@tabler/icons-react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  type ClientSafeProvider,
  type LiteralUnion,
  signIn,
} from "next-auth/react";
import { type BuiltInProviderType } from "next-auth/providers/index";
import { useState } from "react";

export function Login({
  providers,
}: {
  providers: Record<
    LiteralUnion<BuiltInProviderType, string>,
    ClientSafeProvider
  > | null;
}) {
  return (
    <div className="my-20 grid min-h-screen w-full grid-cols-1 md:grid-cols-2">
      <Form providers={providers} />
      <div className="relative z-20 hidden w-full items-center justify-center overflow-hidden border-l border-neutral-100 bg-white dark:border-neutral-800 dark:bg-neutral-900 md:flex">
        <div className="mx-auto max-w-sm">
          {/* <FeaturedTestimonials /> */}
          <p
            className={cn(
              "text-center text-xl font-semibold text-neutral-600 dark:text-neutral-400",
            )}
          >
            Anmelden zum Dashboard
          </p>
          <p
            className={cn(
              "mt-8 text-center text-base font-normal text-neutral-500 dark:text-neutral-400",
            )}
          >
            Mit SmartSavvy zu einer besseren Performance
          </p>
        </div>

        <GridLineHorizontal
          className="left-1/2 top-0 -translate-x-1/2"
          offset="-10px"
        />
        <GridLineHorizontal
          className="bottom-0 left-1/2 top-auto -translate-x-1/2"
          offset="-10px"
        />
        <GridLineVertical
          className="left-10 top-1/2 -translate-y-1/2"
          offset="-10px"
        />
        <GridLineVertical
          className="left-auto right-10 top-1/2 -translate-y-1/2"
          offset="-10px"
        />
        {/* <GridLineVertical className="left-80 transform" /> */}
      </div>
    </div>
  );
}

function Form({
  providers,
}: {
  providers: Record<
    LiteralUnion<BuiltInProviderType, string>,
    ClientSafeProvider
  > | null;
}) {
  const [email, setEmail] = useState<string>("");

  const handleEmail = async () => {
    await signIn("email", { email, callbackUrl: '/app' });
  };

  return (
    <div className="bg-gray-50 dark:bg-neutral-950">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-32">
        <div className="mx-auto w-full max-w-md">
          <div>
            <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-black dark:text-white">
              Anmelden
            </h2>
          </div>

          <div className="mt-10">
            <div>
              <div className="space-y-6">
                {/* <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium leading-6 text-neutral-700 dark:text-neutral-400"
                  >
                    Full name
                  </label>
                  <div className="mt-2">
                    <input
                      id="name"
                      type="name"
                      placeholder="Manu Arora"
                      className="block w-full bg-white dark:bg-neutral-900 px-4 rounded-md border-0 py-1.5  shadow-input text-black placeholder:text-gray-400 focus:ring-2 focus:ring-neutral-400 focus:outline-none sm:text-sm sm:leading-6 dark:text-white"
                    />
                  </div>
                </div> */}

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium leading-6 text-neutral-700 dark:text-neutral-400"
                  >
                    E-Mail
                  </label>

                  <div className="mt-2">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="max.mustermann@email.de"
                      className="block w-full rounded-md border-0 bg-white px-4 py-1.5 text-black shadow-input placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:bg-neutral-900 dark:text-white sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                {/* <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium leading-6 text-neutral-700 dark:text-neutral-400"
                  >
                    Password
                  </label>

                  <div className="mt-2">
                    <input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="block w-full bg-white dark:bg-neutral-900 px-4 rounded-md border-0 py-1.5  shadow-input text-black placeholder:text-gray-400 focus:ring-2 focus:ring-neutral-400 focus:outline-none sm:text-sm sm:leading-6 dark:text-white"
                    />
                  </div>
                </div> */}

                <div>
                  <button onClick={handleEmail} className="relative z-10 flex w-full items-center justify-center rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition duration-200 hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-neutral-100 dark:hover:shadow-xl md:text-sm">
                    Einloggen
                  </button>
                  {/* <p
                    className={cn(
                      "text-sm text-neutral-600 text-center mt-4  dark:text-neutral-400"
                    )}
                  >
                    Already have an account?{" "}
                    <Link href="#" className="text-black dark:text-white">
                      Sign in
                    </Link>
                  </p> */}
                </div>
              </div>
            </div>

            <div className="mt-10">
              <div className="relative">
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div className="w-full border-t border-neutral-300 dark:border-neutral-700" />
                </div>
                <div className="relative flex justify-center text-sm font-medium leading-6">
                  <span className="bg-gray-50 px-6 text-neutral-400 dark:bg-neutral-950 dark:text-neutral-500">
                    Oder mit
                  </span>
                </div>
              </div>

              <div className="mt-6 flex w-full items-center justify-center">
                {/* @ts-expect-error || @ts-ignore */}
                {Object.values(providers).filter((p) => p.id !== "email").map((provider) => (
                  <button
                    onClick={() => signIn(provider.id, { callbackUrl: '/app' })}
                    key={provider.name}
                    className="relative z-10 flex w-full items-center justify-center rounded-full bg-black px-4 py-1.5 text-sm font-medium text-white transition duration-200 hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-neutral-100 dark:hover:shadow-xl md:text-sm"
                  >
                    <IconBrandGoogle className="h-5 w-5" />
                    <span className="text-sm font-semibold leading-6">
                      {provider.name}
                    </span>
                  </button>
                ))}
              </div>

              <p className="mt-8 text-center text-sm text-neutral-600 dark:text-neutral-400">
                Mit der Anmeldung akzeptierst du unsere{" "}
                <Link
                  href="/usage"
                  className="text-neutral-500 dark:text-neutral-300"
                >
                  Nutzungsbedingungen
                </Link>{" "}
                und{" "}
                <Link
                  href="/security"
                  className="text-neutral-500 dark:text-neutral-300"
                >
                  Datenschutzrichtlinien
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Logo = () => {
  return (
    <Link
      href="/"
      className="font-normal flex space-x-2 items-center text-sm mr-4  text-black px-2 py-1  relative z-20"
    >
      <Image
        src="https://assets.aceternity.com/logo-dark.png"
        alt="logo"
        width={30}
        height={30}
      />
      <span className="font-medium text-black dark:text-white">DevStudio</span>
    </Link>
  );
};

export const FeaturedTestimonials = ({
  className,
  containerClassName,
}: {
  textClassName?: string;
  className?: string;
  showStars?: boolean;
  containerClassName?: string;
}) => {
  const images = [
    {
      name: "John Doe",
      src: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3387&q=80",
    },
    {
      name: "Robert Johnson",
      src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
    },
    {
      name: "Jane Smith",
      src: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
    },
    {
      name: "Emily Davis",
      src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    },
    {
      name: "Tyler Durden",
      src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3540&q=80",
    },
    {
      name: "Dora",
      src: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3534&q=80",
    },
  ];
  return (
    <div className={cn("flex flex-col items-center ", containerClassName)}>
      <div
        className={cn(
          "flex flex-col sm:flex-row items-center justify-center mb-2",
          className
        )}
      >
        <div className="flex flex-row items-center mb-4 sm:mb-0">
          {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          images.map((image, idx) => (
            <div className="-mr-4  relative group" key={image.name}>
              <div>
                <motion.div
                  whileHover={{
                    scale: 1.05,
                    zIndex: 30,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                  className="rounded-full overflow-hidden border-2  border-neutral-200  relative"
                >
                  <Image
                    height={100}
                    width={100}
                    src={image.src}
                    alt={image.name}
                    className="object-cover object-top  md:h-14 md:w-14 h-8 w-8 "
                  />
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const GridLineHorizontal = ({
  className,
  offset,
}: {
  className?: string;
  offset?: string;
}) => {
  return (
    <div
      style={
        {
          "--background": "#ffffff",
          "--color": "rgba(0, 0, 0, 0.2)",
          "--height": "1px",
          "--width": "5px",
          "--fade-stop": "90%",
          "--offset": offset ?? "200px", //-100px if you want to keep the line inside
          "--color-dark": "rgba(255, 255, 255, 0.2)",
          maskComposite: "exclude",
        } as React.CSSProperties
      }
      className={cn(
        "absolute w-[calc(100%+var(--offset))] h-[var(--height)] left-[calc(var(--offset)/2*-1)]",
        "bg-[linear-gradient(to_right,var(--color),var(--color)_50%,transparent_0,transparent)]",
        "[background-size:var(--width)_var(--height)]",
        "[mask:linear-gradient(to_left,var(--background)_var(--fade-stop),transparent),_linear-gradient(to_right,var(--background)_var(--fade-stop),transparent),_linear-gradient(black,black)]",
        "[mask-composite:exclude]",
        "z-30",
        "dark:bg-[linear-gradient(to_right,var(--color-dark),var(--color-dark)_50%,transparent_0,transparent)]",
        className
      )}
    ></div>
  );
};

const GridLineVertical = ({
  className,
  offset,
}: {
  className?: string;
  offset?: string;
}) => {
  return (
    <div
      style={
        {
          "--background": "#ffffff",
          "--color": "rgba(0, 0, 0, 0.2)",
          "--height": "5px",
          "--width": "1px",
          "--fade-stop": "90%",
          "--offset": offset ?? "150px", //-100px if you want to keep the line inside
          "--color-dark": "rgba(255, 255, 255, 0.2)",
          maskComposite: "exclude",
        } as React.CSSProperties
      }
      className={cn(
        "absolute h-[calc(100%+var(--offset))] w-[var(--width)] top-[calc(var(--offset)/2*-1)]",
        "bg-[linear-gradient(to_bottom,var(--color),var(--color)_50%,transparent_0,transparent)]",
        "[background-size:var(--width)_var(--height)]",
        "[mask:linear-gradient(to_top,var(--background)_var(--fade-stop),transparent),_linear-gradient(to_bottom,var(--background)_var(--fade-stop),transparent),_linear-gradient(black,black)]",
        "[mask-composite:exclude]",
        "z-30",
        "dark:bg-[linear-gradient(to_bottom,var(--color-dark),var(--color-dark)_50%,transparent_0,transparent)]",
        className
      )}
    ></div>
  );
};
