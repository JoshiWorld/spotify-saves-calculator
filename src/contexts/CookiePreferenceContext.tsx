"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type CookiePreference = "accepted" | "onlyNeeded" | "rejected" | null;

interface CookiePreferenceContextType {
  cookiePreference: CookiePreference;
  setCookiePreference: (preference: CookiePreference) => void;
}

const CookiePreferenceContext = createContext<
  CookiePreferenceContextType | undefined
>(undefined);

export const useCookiePreference = () => {
  const context = useContext(CookiePreferenceContext);
  if (context === undefined) {
    throw new Error(
      "useCookiePreference must be used within a CookiePreferenceProvider",
    );
  }
  return context;
};

export const CookiePreferenceProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [cookiePreference, setCookiePreference] =
    useState<CookiePreference>(null);

  useEffect(() => {
    // Beim ersten Laden den Cookie-Status abrufen
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
      return null;
    };

    const preference = getCookie("cookie_preference") as CookiePreference;
    setCookiePreference(preference);
  }, []);

  return (
    <CookiePreferenceContext.Provider
      value={{ cookiePreference, setCookiePreference }}
    >
      {children}
    </CookiePreferenceContext.Provider>
  );
};
