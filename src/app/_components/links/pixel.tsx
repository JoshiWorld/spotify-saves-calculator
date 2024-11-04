// components/FacebookPixel.tsx
"use client";

import Image from "next/image";
import Script from "next/script";

// fbq('track', 'PageView');
// fbq('trackCustom', 'SSC Link View', {}, { eventID: "ssc-link-view" });
// fbq('init', '${pixelId}', {client_ip_address: '${ip}', fbc: '${fbc}', fbp: '${fbp}'});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function FacebookPixel({ pixelId, ip, fbc, fbp }: { pixelId: string; ip: string; fbc: string; fbp: string }) {
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
        `,
          }}
        />
        <noscript>
          <Image
            height="1"
            alt="Pixel"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          />
        </noscript>
      </>
    );
}

