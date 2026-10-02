import mongoose, { Schema } from "mongoose";
import { SprintStatuses } from "../../constants/agile-workflow.js";

const sprintSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    sprintGoal: { type: String, trim: true, maxlength: 1000, default: "" },
    startDate: { type: Date, required: true },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator(value) {
          return !this.startDate || value >= this.startDate;
        },
        message: "Sprint end date must be on or after its start date",
      },
    },
    status: {
      type: String,
      enum: Object.values(SprintStatuses),
      default: SprintStatuses.PLANNED,
      required: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

sprintSchema.index({ projectId: 1, status: 1 });
sprintSchema.index(
  { projectId: 1 },
  { unique: true, partialFilterExpression: { status: SprintStatuses.ACTIVE } }
);
sprintSchema.virtual("issues", {
  ref: "AgileIssue",
  localField: "_id",
  foreignField: "sprintRef",
});

export const Sprint = mongoose.model("Sprint", sprintSchema);