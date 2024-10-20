import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const clientIp =
    req.headers.get("x-forwarded-for") ??
    req.headers.get("x-real-ip") ??
    req.ip;
  const country = req.geo?.country;
  const region = req.geo?.region;
  const city = req.geo?.city;

  return NextResponse.json({
    ip: clientIp,
    country,
    region,
    city
  });
}
