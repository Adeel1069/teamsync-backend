# Attachment System Documentation

## Overview

The attachment system allows users to upload files to tasks. It uses **Multer** for handling multipart/form-data uploads and stores files locally in the `uploads/` directory.

## Features

- ✅ File upload with validation (type & size)
- ✅ Support for images, documents, and archives
- ✅ 10MB file size limit
- ✅ Unique filename generation to prevent conflicts
- ✅ Soft delete functionality
- ✅ Permission-based deletion (uploader or admin/owner)
- ✅ File serving with security checks
- ✅ Full Swagger documentation

## API Endpoints

### 1. Upload Attachment to Task

**POST** `/api/tasks/:taskId/attachments`

**Headers:**

- `Cookie`: Authentication cookie (httpOnly)

**Body (multipart/form-data):**

- `file`: The file to upload (required)

**Allowed File Types:**

- Images: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`
- Documents: `.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.ppt`, `.pptx`, `.txt`, `.csv`
- Archives: `.zip`, `.rar`, `.7z`

**Max File Size:** 10MB

## File Storage Structure

```
uploads/
├── .gitkeep
├── document-1706352000-123456789.pdf
├── screenshot-1706352100-987654321.png
```

**Filename Format:** `{sanitized-original-name}-{timestamp}-{random-number}.{extension}`

## Migration to Cloud Storage (Future)

The system is designed to easily migrate to cloud storage (AWS S3, Cloudinary, Google Cloud Storage):

1. Replace the multer storage configuration in `src/config/multerConfig.js`
2. Update the upload controller to store files in cloud storage
3. Update the `fileUrl` to point to cloud storage URL
4. Update the `downloadFile` controller to redirect to cloud URL or proxy the request

**Example for AWS S3:**

```javascript
// In multerConfig.js
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const storage = multerS3({
  s3: s3,
  bucket: process.env.AWS_S3_BUCKET,
  key: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    const sanitizedBasename = basename.replace(/[^a-zA-Z0-9-_]/g, "_");
    cb(null, `attachments/${sanitizedBasename}-${uniqueSuffix}${ext}`);
  },
});
```
