import { DeleteObjectCommand, GetObjectCommand, HeadBucketCommand, HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuid } from "uuid";
import { env } from "../config/env.js";
import { s3Client } from "../config/s3.js";
import { AppError } from "../utils/AppError.js";

const sanitizeFileName = (name) => name.replace(/[^a-zA-Z0-9._-]/g, "_");

/**
 * Wraps a promise with a timeout
 * @param {Promise} promise - Promise to wrap
 * @param {number} ms - Timeout in milliseconds (default: 30000)
 * @param {string} operation - Operation name for error message
 */
const withTimeout = (promise, ms = 30000, operation = "Operation") => 
  Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new AppError(`${operation} timed out after ${ms}ms`, 504)), ms)
    )
  ]);

const awsErrorMessages = {
  AccessDenied: "S3 access denied. Check the EC2 instance profile permissions for this bucket and key prefix.",
  InvalidAccessKeyId: "AWS credential resolution failed. Check the EC2 instance profile or local AWS profile.",
  SignatureDoesNotMatch: "AWS request signature did not match. Check AWS_REGION and the instance profile credentials.",
  NoSuchBucket: "S3 bucket does not exist. Check S3_BUCKET_NAME.",
  CredentialsProviderError: "AWS credentials are missing or could not be loaded. Attach an IAM role to EC2 or configure a local AWS profile.",
  PermanentRedirect: "S3 bucket is in a different region. Check AWS_REGION.",
  AuthorizationHeaderMalformed: "AWS region mismatch for this S3 bucket. Check AWS_REGION."
};

export const toS3Error = (error, fallbackMessage = "Unknown S3 error") => {
  const code =
    error.name === "Unknown" && error.$metadata?.httpStatusCode === 403
      ? "AccessDenied"
      : error.name || error.Code || error.code;
  const message = awsErrorMessages[code] || error.message || fallbackMessage;
  const statusCode = code === "NoSuchKey" || error.$metadata?.httpStatusCode === 404 ? 404 : 500;

  return new AppError(message, statusCode, {
    code,
    requestId: error.$metadata?.requestId,
    httpStatusCode: error.$metadata?.httpStatusCode
  });
};

export const buildS3Key = ({ userId, originalName }) => {
  const safeName = sanitizeFileName(originalName);
  return `${userId}/uploads/${uuid()}-${safeName}`;
};

export const uploadFileToS3 = async ({ key, file }) => {
  console.log("[s3] Starting upload", {
    bucket: env.s3BucketName,
    region: env.awsRegion,
    key,
    contentType: file.mimetype,
    size: file.size
  });

  try {
    const result = await withTimeout(
      s3Client.send(
        new PutObjectCommand({
          Bucket: env.s3BucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          Metadata: {
            originalName: file.originalname
          }
        })
      ),
      30000,
      "S3 upload"
    );

    console.log("[s3] Upload successful", {
      bucket: env.s3BucketName,
      region: env.awsRegion,
      key,
      eTag: result.ETag,
      requestId: result.$metadata?.requestId
    });

    return result;
  } catch (error) {
    console.error("[s3] Upload failed", {
      bucket: env.s3BucketName,
      region: env.awsRegion,
      key,
      errorName: error.name,
      errorMessage: error.message,
      metadata: error.$metadata
    });
    console.error(error);
    throw toS3Error(error, "Unknown S3 upload error");
  }
};

export const deleteFileFromS3 = async (key) => {
  try {
    await withTimeout(
      s3Client.send(
        new DeleteObjectCommand({
          Bucket: env.s3BucketName,
          Key: key
        })
      ),
      30000,
      "S3 delete"
    );
  } catch (error) {
    console.error("[s3] Delete failed", {
      bucket: env.s3BucketName,
      region: env.awsRegion,
      key,
      errorName: error.name,
      errorMessage: error.message,
      metadata: error.$metadata
    });
    throw toS3Error(error, "Failed to delete S3 object");
  }
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

export const createPreviewUrl = async ({ key, fileName, contentType }) => {
  try {
    await s3Client.send(
      new HeadObjectCommand({
        Bucket: env.s3BucketName,
        Key: key
      })
    );

    const command = new GetObjectCommand({
      Bucket: env.s3BucketName,
      Key: key,
      ResponseContentDisposition: `inline; filename="${sanitizeFileName(fileName)}"`,
      ResponseContentType: contentType || undefined
    });

    return getSignedUrl(s3Client, command, {
      expiresIn: env.s3SignedUrlExpiresSeconds
    });
  } catch (error) {
    console.error("[s3] Preview URL generation failed", {
      bucket: env.s3BucketName,
      region: env.awsRegion,
      key,
      errorName: error.name,
      errorMessage: error.message,
      metadata: error.$metadata
    });
    console.error(error);
    throw toS3Error(error, "Failed to create S3 preview URL");
  }
};

export const logS3BucketConnectivity = async () => {
  console.log("[s3] Checking bucket connectivity", {
    bucket: env.s3BucketName,
    region: env.awsRegion
  });

  try {
    const result = await s3Client.send(
      new HeadBucketCommand({
        Bucket: env.s3BucketName
      })
    );

    console.log("[s3] Bucket connectivity ok", {
      bucket: env.s3BucketName,
      region: env.awsRegion,
      requestId: result.$metadata?.requestId
    });
  } catch (error) {
    console.error("[s3] Bucket connectivity failed", {
      bucket: env.s3BucketName,
      region: env.awsRegion,
      errorName: error.name,
      errorMessage: error.message,
      metadata: error.$metadata
    });
    console.error(error);
  }
};
