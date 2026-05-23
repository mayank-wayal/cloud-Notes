import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuid } from "uuid";
import { env } from "../config/env.js";
import { s3Client } from "../config/s3.js";

const sanitizeFileName = (name) => name.replace(/[^a-zA-Z0-9._-]/g, "_");

export const buildS3Key = ({ userId, originalName }) => {
  const safeName = sanitizeFileName(originalName);
  return `users/${userId}/notes/${uuid()}-${safeName}`;
};

export const uploadFileToS3 = async ({ key, file }) => {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: env.s3BucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        originalName: file.originalname
      }
    })
  );
};

export const deleteFileFromS3 = async (key) => {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: env.s3BucketName,
      Key: key
    })
  );
};

export const createDownloadUrl = async ({ key, fileName }) => {
  const command = new GetObjectCommand({
    Bucket: env.s3BucketName,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${sanitizeFileName(fileName)}"`
  });

  return getSignedUrl(s3Client, command, {
    expiresIn: env.s3SignedUrlExpiresSeconds
  });
};
