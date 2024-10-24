import { env } from "@/env";
// import { v4 as uuidv4 } from "uuid";
import { getServerAuthSession } from "@/server/auth";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { type NextRequest, NextResponse } from "next/server";

const s3 = new S3Client({
  region: env.S3_REGION,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = env.S3_BUCKET_NAME;
const BUCKET_FOLDER = 'links';

export async function POST(req: NextRequest) {
  const session = await getServerAuthSession();
  if(!session || session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "File is required." }, { status: 400 });
    }

    // @ts-expect-error || file.arrayBuffer() is always there, when a file is delivered
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
    const buffer = Buffer.from(await file.arrayBuffer());
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    // const fileExtension = file.name.split(".").pop();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    // const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    // @ts-expect-error || its always true
    const fileName = `${BUCKET_FOLDER}/${Date.now()}-${file.name}`;

    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: `${fileName}`,
      Body: buffer,
      ContentType: "image/jpg",
    };

    const command = new PutObjectCommand(uploadParams);
    await s3.send(command);

    const link = `https://${env.S3_BUCKET_NAME}.s3.${env.S3_REGION}.amazonaws.com/${fileName}`;

    return NextResponse.json({ success: true, link }, { status: 200 });
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    return NextResponse.json(
      { error: "Internal Server error" },
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
      ContentType: "image/jpg",
    };

    const command = new PutObjectCommand(uploadParams);
    await s3.send(command);

    const link = `https://${env.S3_BUCKET_NAME}.s3.${env.S3_REGION}.amazonaws.com/${fileName}`;

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
    `https://${BUCKET_NAME}.s3.${env.S3_REGION}.amazonaws.com/(.*)`,
  );
  const match = url.match(urlPattern);

  return match ? match[1] : null;
}
