import { useEffect } from "react";
import { getCalApi } from "@calcom/embed-react";

interface CalEmbedOptions {
  namespace: string;
  styles?: {
    branding?: {
      brandColor?: string;
    };
  };
  hideEventTypeDetails?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-redundant-type-constituents
  layout?: "month_view" | "week_view" | "day_view" | any;
}

export const useCalEmbed = (options: CalEmbedOptions) => {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async function () {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const cal = await getCalApi({ namespace: options.namespace });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      cal("ui", {
        styles: options.styles,
        hideEventTypeDetails: options.hideEventTypeDetails,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        layout: options.layout,
      });
    })();
  }, [options]);

  return {
    namespace: options.namespace,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    layout: options.layout,
  };
};
