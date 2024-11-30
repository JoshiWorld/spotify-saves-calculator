// app/api/protected/s3/generateUrl/route.ts

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/env";
import { type NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/server/auth";

const s3 = new S3Client({
  region: env.S3_REGION,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
});

export async function POST(req: NextRequest) {
  const session = await getServerAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 403 });
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { filename, fileType } = await req.json();

  if (!filename || !fileType) {
    return NextResponse.json(
      { error: "Missing filename or fileType" },
      { status: 400 },
    );
  }

  try {
    const key = `links/${Date.now()}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: env.S3_BUCKET_NAME,
      Key: key,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      ContentType: fileType,
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 120 });

    return NextResponse.json({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      uploadUrl,
      key,
      // imageUrl: `https://${env.S3_BUCKET_NAME}.s3.${env.S3_REGION}.amazonaws.com/`,
      imageUrl: `https://${env.CLOUDFRONT_KEY}.cloudfront.net/`,
    });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return NextResponse.json(
      { error: "Error generating signed URL" },
      { status: 500 },
    );
  }
}
