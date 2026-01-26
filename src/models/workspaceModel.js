import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          // Only lowercase letters, numbers, and hyphens
          // Must start and end with letter or number
          return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid slug! Use only lowercase letters, numbers, and hyphens.`,
      },
    },
    description: {
      type: String,
      trim: true,
    },
    logo: {
      type: String, // URL or path to the image
      default: null,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    settings: {
      allowMemberProjectCreation: {
        type: Boolean,
        default: false, // Only admins can create projects by default
      },
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

// Helper function to generate slug from name
function generateSlugFromName(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Pre-save hook: Auto-generate unique slug from name if not provided
workspaceSchema.pre("save", async function () {
  if (this.isNew && !this.slug) {
    this.slug = await this.constructor.generateUniqueSlug(this.name);
  }
});

// Static method to find available slug (with suffix if collision)
workspaceSchema.statics.findAvailableSlug = async function (baseSlug) {
  let slug = baseSlug;
  let counter = 1;

  while (await this.exists({ slug, deletedAt: null })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

// Static method to generate and find available slug from name
workspaceSchema.statics.generateUniqueSlug = async function (name) {
  const baseSlug = generateSlugFromName(name);
  return await this.findAvailableSlug(baseSlug);
};

const Workspace = mongoose.model("Workspace", workspaceSchema);

export default Workspace;
