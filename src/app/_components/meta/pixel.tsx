"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function FacebookPixelEvents({ pixelId }: { pixelId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // @ts-expect-error || IGNORE
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async () => {
    await import("react-facebook-pixel")
      .then((x) => x.default)
      .then((ReactPixel) => {
        ReactPixel.init(pixelId);
        ReactPixel.pageView();
      });
  }, [pathname, pixelId, searchParams]);

  return null;
}

// export const nameEvent = async () => {
//   const { default: ReactPixel } = await import("react-facebook-pixel");
//   ReactPixel.init("Your Pixel ID");
//   ReactPixel.track("Name", { data });
// };