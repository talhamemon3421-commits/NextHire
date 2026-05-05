import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config();

const r2Client = new S3Client({
  region: process.env.R2_REGION || 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Uploads a file buffer to Cloudflare R2 and returns its public URL/key.
 * @param {Buffer} fileBuffer - The file buffer to upload.
 * @param {string} mimetype - The MIME type of the file.
 * @param {string} originalName - Original file name properly sanitized.
 * @returns {Promise<string>} - The public URL or object key of the uploaded picture.
 */
export const uploadProfilePicture = async (fileBuffer, mimetype, originalName) => {
  const extension = originalName.split('.').pop();
  const fileName = `employer-profile-pictures/${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimetype,
  });

  await r2Client.send(command);

  // If a public domain is configured (like r2.dev), we MUST use it because S3 endpoints are private
  if (process.env.R2_PUBLIC_URL) {
    const baseUrl = process.env.R2_PUBLIC_URL.replace(/\/$/, '');
    return `${baseUrl}/${fileName}`;
  }
  
  // Otherwise, return a relative URL pointing to our local Express proxy route
  return `/api/employers/avatar/${encodeURIComponent(fileName)}`;
};

/**
 * Fetches an object buffer from Cloudflare R2.
 * @param {string} fileName - The object key
 * @returns {Promise<{buffer: Buffer, mimetype: string}>}
 */
export const fetchProfilePicture = async (fileName) => {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileName,
  });

  const response = await r2Client.send(command);
  const byteArray = await response.Body.transformToByteArray();
  
  return {
    buffer: Buffer.from(byteArray),
    mimetype: response.ContentType || 'image/jpeg'
  };
};
