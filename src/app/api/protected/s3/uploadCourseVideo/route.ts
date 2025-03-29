// app/api/protected/s3/generateUrl/route.ts

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
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

const BUCKET_NAME = env.S3_BUCKET_NAME;
const BUCKET_FOLDER = "videos";

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
    const key = `${BUCKET_FOLDER}/${Date.now()}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
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

export async function PUT(req: NextRequest) {
  const session = await getServerAuthSession();
  if (!session || session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const old = formData.get("old");

    if (!file) {
      return NextResponse.json({ error: "File is required." }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    const oldImageKey = extractKeyFromUrl(old!.toString());
    const deleteParams = {
      Bucket: BUCKET_NAME,
      Key: oldImageKey,
    };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const deleteCommand = new DeleteObjectCommand(deleteParams);
    await s3.send(deleteCommand);

    // @ts-expect-error || file.arrayBuffer() is always there, when a file is delivered
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
    const buffer = Buffer.from(await file.arrayBuffer());
    // @ts-expect-error || its always true
    const fileName = `${BUCKET_FOLDER}/${Date.now()}-${file.name}`;

    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: `${fileName}`,
      Body: buffer,
      ContentType: getContentType(fileName),
    };

    const command = new PutObjectCommand(uploadParams);
    await s3.send(command);

    const link = `https://${env.CLOUDFRONT_KEY}.cloudfront.net/${fileName}`;

    return NextResponse.json({ success: true, link }, { status: 200 });
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    return NextResponse.json(
      { error: "Internal Server error" },
      { status: 500 },
    );
  }
}

function extractKeyFromUrl(url: string) {
  const urlPattern = new RegExp(
    `https://${env.CLOUDFRONT_KEY}.cloudfront.net/(.*)`,
  );
  const match = url.match(urlPattern);

  return match ? match[1] : null;
}

function getContentType(fileName: string): string {
  // @ts-expect-error || cannot be undefined
  const extension = fileName.split(".").pop().toLowerCase();
  switch (extension) {
    case "mp4":
      return "video/mp4";
    case "webm":
      return "video/webm";
    case "ogg":
      return "video/ogg";
    case "mov":
      return "video/quicktime"; // oder video/mp4
    default:
      return "application/octet-stream";
  }
}