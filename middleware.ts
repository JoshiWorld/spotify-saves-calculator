import { type NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const fbclid = url.searchParams.get("fbclid");

  if (fbclid) {
    const response = NextResponse.next();
    response.cookies.set("_fbc", `fb.${Date.now()}.${fbclid}`, {
      maxAge: 90 * 24 * 60 * 60, // 90 days
      path: "/",
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"], // Apply middleware only to specific paths
};
