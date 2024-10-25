// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: Request) {
  return new Response("ok", {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
}
