import multer from 'multer';
import type { Request } from 'express';
import { AppError } from '../errors/AppError';
import { ErrorCode } from '../errors/errorCodes';

// ─────────────────────────────────────────────────────────────────────────────
// Allowed MIME types per api-conventions.md:
//   Images: jpg, jpeg, png, webp
//   Documents: pdf
//
// Per backend-rules.md: "Sanitize file uploads (check MIME type, not extension)"
// ─────────────────────────────────────────────────────────────────────────────

const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_DOCUMENT_MIMES = ['application/pdf'];
const ALL_ALLOWED_MIMES = [...ALLOWED_IMAGE_MIMES, ...ALLOWED_DOCUMENT_MIMES];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB per api-conventions.md

// ─────────────────────────────────────────────────────────────────────────────
// Storage — memory storage (files are piped to Cloudinary, never saved to disk)
// ─────────────────────────────────────────────────────────────────────────────

const storage = multer.memoryStorage();

// ─────────────────────────────────────────────────────────────────────────────
// File filter — MIME type check (not extension)
// ─────────────────────────────────────────────────────────────────────────────

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
): void {
  if (ALL_ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `File type not allowed. Allowed types: jpg, jpeg, png, webp, pdf`,
        400,
        ErrorCode.VALIDATION_ERROR,
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Exported upload middleware instances
// Field name: "file" per api-conventions.md
// ─────────────────────────────────────────────────────────────────────────────

export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).single('file');

export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).array('file', 10); // max 10 files
