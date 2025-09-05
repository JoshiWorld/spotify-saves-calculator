"use client";

import { getCookie } from "@/hooks/cookie";
import Script from "next/script";

export function FacebookPixel({
  pixelId,
  viewEventId,
}: {
  pixelId: string;
  viewEventId: string;
}) {
  const externalId = getCookie("anonymous_id");

  const pixelInit = externalId ? 
  `fbq('init', '${pixelId}', {'external_id': '${externalId}'});` :
  `fbq('init', '${pixelId}');`;

  return (
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

      ${pixelInit}
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
  );
}
