import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET ?? "pisure-assets";

if (!accountId || !accessKeyId || !secretAccessKey) {
  console.warn(
    "R2 env vars are not set — uploads and image serving will fail. See SETUP.md.",
  );
}

export const r2 = new S3Client({
  region: "auto",
  endpoint: accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined,
  credentials: { accessKeyId: accessKeyId ?? "", secretAccessKey: secretAccessKey ?? "" },
});

const ACCOUNT = accountId ?? "";
const BUCKET = bucket;

/** Build an object key: uploads/{userId}/{assetId}/{derivative}.{ext} */
export function buildKeys(userId: string, assetId: string, ext: string) {
  const safeExt = ext.replace(/[^a-z0-9]/gi, "").toLowerCase() || "jpg";
  return {
    originalKey: `uploads/${userId}/${assetId}/original.${safeExt}`,
    webKey: `uploads/${userId}/${assetId}/web.jpg`,
    thumbKey: `uploads/${userId}/${assetId}/thumb.jpg`,
  };
}

export async function presignUpload(key: string, contentType: string, expiresIn = 900) {
  const cmd = new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType });
  return getSignedUrl(r2, cmd, { expiresIn });
}

export function publicUrl(key: string) {
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (!base) {
    // Fallback to the raw R2 endpoint (works but uncached) so the app
    // still renders during setup before the CDN domain is wired.
    return `https://${ACCOUNT}.r2.cloudflarestorage.com/${BUCKET}/${key}`;
  }
  return `${base.replace(/\/$/, "")}/${key}`;
}

export async function deleteObjects(keys: string[]) {
  await Promise.all(
    keys.map((key) => r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))),
  );
}

export function newAssetId() {
  return randomUUID();
}
