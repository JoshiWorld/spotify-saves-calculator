import { createRouteHandler } from "uploadthing/next"; // Korrekter Import

import { ourFileRouter } from "./core";

// Export routes for Next App Router
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
