"use client";

import Script from "next/script";

export function GTMHead() {
  return (
    <head>
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id=' + i + dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-TGHX98VV');
          `,
        }}
      />
    </head>
  );
}

export function GTMBody() {
  return (
    <noscript>
      <iframe
        src="https://www.googletagmanager.com/ns.html?id=GTM-TGHX98VV"
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
}

export function pushToDataLayer(
  event: string,
  data: Record<string, string | number | null | undefined>,
) {
  //@ts-expect-error || @ts-ignore
  if (typeof window !== "undefined" && window.dataLayer) {
    //@ts-expect-error || @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    window.dataLayer.push({
      event,
      ...data,
    });
    console.log(`Event "${event}" pushed to dataLayer:`, data);
  } else {
    console.warn("DataLayer is not available.");
  }
}

export function setPixelID(pixelID: string) {
  //@ts-expect-error || @ts-ignore
  if (typeof window !== "undefined" && window.dataLayer) {
    //@ts-expect-error || @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    window.dataLayer.push({ pixelID });
    console.log(`Pixel-ID "${pixelID}" wurde in den DataLayer geladen.`);
  }
}

export function setConversionToken(accessToken: string) {
  //@ts-expect-error || @ts-ignore
  if (typeof window !== "undefined" && window.dataLayer) {
    //@ts-expect-error || @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    window.dataLayer.push({ accessToken });
    // console.log(`Pixel-ID "${accessToken}" wurde in den DataLayer geladen.`);
  }
}

export function setTestEventCode(testEventCode: string | null) {
  //@ts-expect-error || @ts-ignore
  if (typeof window !== "undefined" && window.dataLayer) {
    //@ts-expect-error || @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    window.dataLayer.push({ testEventCode });
    // console.log(`Pixel-ID "${accessToken}" wurde in den DataLayer geladen.`);
  }
}