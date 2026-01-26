import mongoose from "mongoose";

const labelSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      default: "#gray",
    },
    description: {
      type: String,
      trim: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index: unique label name per workspace
labelSchema.index({ workspace: 1, name: 1, deletedAt: 1 }, { unique: true });

const Label = mongoose.model("Label", labelSchema);

export default Label;
