// components/FacebookPixel.tsx
"use client";

import Script from "next/script";
import { useCookiePreference } from "@/contexts/CookiePreferenceContext";
import { useEffect, useState } from "react";

export function FacebookPixel({
  pixelId,
  ip,
  fbc,
  fbp,
  viewEventId,
}: {
  pixelId: string;
  ip: string;
  fbc: string;
  fbp: string;
  viewEventId: string;
}) {
  const { cookiePreference } = useCookiePreference();
  const [cookieAccepted, setCookieAccepted] = useState<boolean>(
    cookiePreference === "accepted" || cookiePreference === "onlyNeeded"
  );

  useEffect(() => {
    if (cookiePreference === "accepted" || cookiePreference === "onlyNeeded") {
      setCookieAccepted(true);
    }
  }, [cookiePreference]);

  return (
    <>
      {true && (
        <Script
          id="fb-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
      !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');

      fbq('init', '${pixelId}');
      // fbq(
      //   "trackCustom",
      //   "SmartSavvy Link Visit",
      //   {
      //     // content_name: link.name,
      //     // content_category: "visit",
      //   },
      //   { eventID: ${viewEventId} },
      // );
    `,
          }}
        />
      )}
    </>
  );
}
