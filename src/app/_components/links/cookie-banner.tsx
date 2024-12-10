"use client";

import { api } from "@/trpc/react";
import { CookieIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

const COOKIE_NAME = "cookie_preference";

export const CookieBanner: React.FC = () => {
  const pathname = usePathname();
  const isAppPath = pathname.includes('app');

  const [isVisible, setIsVisible] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [minimalized, setMinimalized] = useState(false);
  const createConsent = api.consent.create.useMutation();
  const updateConsent = api.consent.update.useMutation();

  useEffect(() => {
    const cookiePreference = getCookie(COOKIE_NAME);
    const anonymousId = getCookie("anonymous_id");

    if (!cookiePreference) {
      if (!anonymousId) {
        setCookie("anonymous_id", uuidv4(), 365);
      }
      setIsVisible(true);
    } else {
      setMinimalized(true);
    }
  }, []);

  // COOKIE LOGIC
  const setCookie = (name: string, value: string, days: number) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/; SameSite=Strict`;
  };

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
  };

  // SETTER FOR COOKIE
  const acceptCookies = () => {
    const anonymousId = getCookie("anonymous_id");
    if(!getCookie(COOKIE_NAME)) {
      createConsent.mutate({
        anonymousId: anonymousId!,
        consentGiven: true,
        consentType: "cookies"
      });
    } else {
      updateConsent.mutate({
        anonymousId: anonymousId!,
        consentGiven: true,
        consentType: "cookies",
      });
    }
    setCookie(COOKIE_NAME, "accepted", 365);
    setIsVisible(false);
    setMinimalized(true);
  };

  const acceptNeededCookies = () => {
    const anonymousId = getCookie("anonymous_id");
    if (!getCookie(COOKIE_NAME)) {
      createConsent.mutate({
        anonymousId: anonymousId!,
        consentGiven: true,
        consentType: "cookies",
      });
    } else {
      updateConsent.mutate({
        anonymousId: anonymousId!,
        consentGiven: true,
        consentType: "cookies",
      });
    }
    setCookie(COOKIE_NAME, "onlyNeeded", 365);
    setIsVisible(false);
    setMinimalized(true);
  };

  const rejectCookies = () => {
    const anonymousId = getCookie("anonymous_id");
    if (!getCookie(COOKIE_NAME)) {
      createConsent.mutate({
        anonymousId: anonymousId!,
        consentGiven: false,
        consentType: "cookies",
      });
    } else {
      updateConsent.mutate({
        anonymousId: anonymousId!,
        consentGiven: false,
        consentType: "cookies",
      });
    }
    setCookie(COOKIE_NAME, "rejected", 365);
    setIsVisible(false);
    setMinimalized(true);
  };

  if(isAppPath) {
    return null;
  }

  return (
    <>
      {isVisible ? (
        <div className="fixed bottom-0 z-50 flex w-full flex-col items-center justify-center border-t-2 border-white bg-background p-4 text-white shadow-lg sm:flex-row">
          <div className="flex flex-col items-center justify-center gap-2">
            <button
              className="w-full max-w-md rounded bg-purple-700 px-4 py-2 text-sm text-white transition-all hover:bg-purple-800 sm:text-base"
              onClick={acceptCookies}
            >
              Alle zustimmen
            </button>
            <button
              className="w-full max-w-md rounded bg-purple-700 px-4 py-2 text-sm text-white transition-all hover:bg-purple-800 sm:text-base"
              onClick={acceptNeededCookies}
            >
              Nur erforderliche Cookies
            </button>
            <button
              className="w-full max-w-md rounded bg-purple-700 px-4 py-2 text-sm text-white transition-all hover:bg-purple-800 sm:text-base"
              onClick={rejectCookies}
            >
              Alle ablehnen
            </button>
            <p className="mb-3 text-sm sm:mb-0 sm:text-base">
              Wir benutzen Cookies, um die Nutzererfahrung zu verbessern. Beim
              Akzeptieren werden Cookies gespeichert. Erfahre mehr in unserer{" "}
              <a href="/privacy" className="text-blue-400 underline">
                Datenschutzerklärung
              </a>
              .
            </p>
          </div>
        </div>
      ) : (
        <div
          className="fixed bottom-4 right-4 z-50 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full dark:bg-purple-950 text-white shadow-lg"
          onClick={() => {
            setMinimalized(false);
            setIsVisible(true);
          }}
        >
          {/* ⚙️ */}
          <CookieIcon />
        </div>
      )}
    </>
  );
};