// components/FacebookPixel.tsx
"use client";

import Script from "next/script";

// fbq('track', 'PageView');
// fbq('trackCustom', 'SSC Link View', {}, { eventID: "ssc-link-view" });
// fbq('init', '${pixelId}', {client_ip_address: '${ip}', fbc: '${fbc}', fbp: '${fbp}'});

export function FacebookPixel({
  pixelId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ip,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fbc,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fbp,
  viewEventId,
}: {
  pixelId: string;
  ip: string;
  fbc: string;
  fbp: string;
  viewEventId: string;
}) {
  return (
    <>
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
    </>
  );
}
