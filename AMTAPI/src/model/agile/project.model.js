import mongoose, { Schema } from "mongoose";

const projectSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    key: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      match: /^[A-Z][A-Z0-9]{1,9}$/,
      unique: true,
    },
    description: { type: String, trim: true, maxlength: 2000, default: "" },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    lead: { type: Schema.Types.ObjectId, ref: "User", required: true },
    activeSprint: { type: Schema.Types.ObjectId, ref: "Sprint", default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

projectSchema.index({ members: 1, isActive: 1 });
projectSchema.virtual("sprints", {
  ref: "Sprint",
  localField: "_id",
  foreignField: "projectId",
});
projectSchema.virtual("issues", {
  ref: "AgileIssue",
  localField: "_id",
  foreignField: "projectRef",
});

export const Project = mongoose.model("Project", projectSchema);