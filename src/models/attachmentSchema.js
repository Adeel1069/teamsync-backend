import mongoose from "mongoose";
import { ATTACHMENT_ENTITY_TYPES } from "../constants/index.js";

const attachmentSchema = new mongoose.Schema(
  {
    // Polymorphic: can attach to different entity types
    entityType: {
      type: String,
      enum: Object.values(ATTACHMENT_ENTITY_TYPES),
      required: true,
      index: true,
    },
    // Reference to Project, Task, or Comment _id
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    // Store in bytes
    fileSize: {
      type: Number,
      required: true,
      min: 0,
    },
    // URL or path to the file (S3 or CloudStorage)
    fileUrl: {
      type: String,
      required: true,
    },
    // Store S3 key or storage identifier separately for easier management - Optional
    storageKey: {
      type: String,
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for querying attachments by entity
attachmentSchema.index({ entityType: 1, entityId: 1, deletedAt: 1 });

const Attachment = mongoose.model("Attachment", attachmentSchema);

export default Attachment;
