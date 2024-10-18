import { env } from "@/env";
import { NextResponse } from "next/server";

export async function GET() {
  const META_APP_ID = env.META_APP_ID;
  const redirectUri =
    env.NODE_ENV !== "production"
      ? encodeURIComponent("http://localhost:3000/meta/callback")
      : encodeURIComponent("https://ssc.brokoly.de/meta/callback");

  // Erstelle die Meta-Login-URL
  const authUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${redirectUri}&scope=ads_read,business_management`;

  // Umleiten zur Login-Seite von Meta
  return NextResponse.redirect(authUrl);
}
