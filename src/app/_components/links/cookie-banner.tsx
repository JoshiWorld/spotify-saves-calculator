"use client";

import React, { useState, useEffect } from "react";

const COOKIE_NAME = "cookie_preference";

export const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const cookiePreference = getCookie(COOKIE_NAME);
    if (!cookiePreference) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    setCookie(COOKIE_NAME, "accepted", 365);
    setIsVisible(false);
  };

  const acceptNeededCookies = () => {
    setCookie(COOKIE_NAME, "onlyNeeded", 365);
    setIsVisible(false);
  };

  const rejectCookies = () => {
    setCookie(COOKIE_NAME, "rejected", 365);
    setIsVisible(false);
  };

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

  if (!isVisible) {
    return null;
  }

  return (
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
  );
};