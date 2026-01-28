import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import AppError from "../utils/AppError.js";
import { StatusCodes } from "http-status-codes";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Store files in uploads/ directory at project root
    const uploadPath = path.join(__dirname, "../../uploads");
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    // Sanitize filename
    const sanitizedBasename = basename.replace(/[^a-zA-Z0-9-_]/g, "_");
    cb(null, `${sanitizedBasename}-${uniqueSuffix}${ext}`);
  },
});

// File filter - allow images and common document types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    // Images
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    // Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
    "text/plain",
    "text/csv",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `File type not allowed. Allowed types: images, PDFs, documents, archives`,
        StatusCodes.BAD_REQUEST,
      ),
      false,
    );
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});

export default upload;
