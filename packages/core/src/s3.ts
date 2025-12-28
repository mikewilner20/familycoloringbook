import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from './env';

export const s3 = new S3Client({
  region: env.S3_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY
  }
});

export async function presignUpload(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: key,
    ContentType: contentType
  });
  const url = await getSignedUrl(s3, command, { expiresIn: 60 * 10 });
  return { url, key };
}

export async function fetchObject(key: string) {
  const res = await s3.send(
    new GetObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key
    })
  );
  const body = await res.Body?.transformToByteArray();
  if (!body) throw new Error(`Missing body for key ${key}`);
  return body;
}

export async function putObject(key: string, body: Uint8Array, contentType: string) {
  await s3.send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType
    })
  );
}
