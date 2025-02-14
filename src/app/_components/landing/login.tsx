"use client";

import Link from "next/link";
import { IconBrandGoogle } from "@tabler/icons-react";
import {
  type ClientSafeProvider,
  type LiteralUnion,
  signIn,
} from "next-auth/react";
import { type BuiltInProviderType } from "next-auth/providers/index";
import { useState } from "react";
// import styles from "./login.module.css";

export function Login({
  providers,
}: {
  providers: Record<
    LiteralUnion<BuiltInProviderType, string>,
    ClientSafeProvider
  > | null;
}) {
  return (
    <div className="z-10 mt-20 rounded-sm border border-white border-opacity-40 bg-zinc-950 bg-opacity-95 p-5 shadow-xl transition">
      <Form providers={providers} />
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
    await signIn("email", {
      email,
      // otp,
      callbackUrl: "/app",
    });
  };

  return (
    <div>
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

                <div>
                  <button
                    onClick={handleEmail}
                    className="relative z-10 flex w-full items-center justify-center rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition duration-200 hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-neutral-100 dark:hover:shadow-xl md:text-sm"
                  >
                    Einloggen
                  </button>
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
                {Object.values(providers)
                  .filter((p) => p.id !== "email" && p.id !== "credentials")
                  .map((provider) => (
                    <button
                      onClick={() =>
                        signIn(provider.id, { callbackUrl: "/app" })
                      }
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
                  href="/privacy"
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
