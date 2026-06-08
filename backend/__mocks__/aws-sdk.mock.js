// Mock AWS S3 Client
import { jest } from "@jest/globals";

export const mockS3Client = {
  send: jest.fn(),
};

export const mockGetObjectCommand = jest.fn();
export const mockPutObjectCommand = jest.fn();
export const mockDeleteObjectCommand = jest.fn();

// Create a factory function for mocking S3Client
export const S3ClientMock = jest.fn(() => mockS3Client);

// Mock AWS SDK
export const mockS3Service = {
  generatePresignedUrl: jest.fn(() =>
    Promise.resolve('https://example.s3.amazonaws.com/presigned-url')
  ),
  uploadFile: jest.fn(() =>
    Promise.resolve({ key: 'test-file.pdf', url: 'https://example.s3.amazonaws.com/test-file.pdf' })
  ),
  deleteFile: jest.fn(() => Promise.resolve()),
};
