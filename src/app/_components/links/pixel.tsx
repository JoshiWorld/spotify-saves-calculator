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
  fbc,
  fbp,
}: {
  pixelId: string;
  ip: string;
  fbc: string;
  fbp: string;
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

      fbq('init', '${pixelId}', {
        // em: '${fbc}', 
        // fbp: '${fbp}'
      });
    `,
        }}
      />
      {/* <Script
        id="gtm"
        dangerouslySetInnerHTML={{
          __html: `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TGHX98VV');
        `,
        }}
      /> */}
      {/* <noscript>
        <iframe
          src="https://www.googletagmanager.com/ns.html?id=GTM-TGHX98VV"
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        ></iframe>
      </noscript> */}
      {/* <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        />
      </noscript> */}
    </>
  );
}
