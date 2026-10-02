import mongoose, { Schema } from "mongoose";
import { IssuePriorities, IssueStatuses } from "../../constants/agile-workflow.js";
import { Counter } from "../counter.model.js";
import { Project } from "./project.model.js";

const issueStatusHistorySchema = new Schema(
  {
    status: { type: String, enum: Object.values(IssueStatuses), required: true },
    changedAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false }
);
const issueSprintHistorySchema = new Schema(
  {
    sprintRef: { type: Schema.Types.ObjectId, ref: "Sprint", default: null },
    changedAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false }
);

const issueSchema = new Schema(
  {
    issueKey: { type: String, required: true, unique: true },
    projectRef: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    sprintRef: {
      type: Schema.Types.ObjectId,
      ref: "Sprint",
      default: null,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 5000, default: "" },
    status: {
      type: String,
      enum: Object.values(IssueStatuses),
      default: IssueStatuses.BACKLOG,
      required: true,
    },
    priority: {
      type: String,
      enum: Object.values(IssuePriorities),
      default: IssuePriorities.MEDIUM,
      required: true,
    },
    storyPoints: { type: Number, min: 0, max: 100, default: 0 },
    assigneeRef: { type: Schema.Types.ObjectId, ref: "User", default: null },
    statusHistory: { type: [issueStatusHistorySchema], default: [] },
    sprintHistory: { type: [issueSprintHistorySchema], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

issueSchema.index({ projectRef: 1, sprintRef: 1, status: 1 });
issueSchema.index({ projectRef: 1, issueKey: 1 }, { unique: true });
issueSchema.pre("validate", async function () {
  if (!this.isNew || this.issueKey) return;

  const project = await Project.findById(this.projectRef).select("key");
  if (!project) return;

  const counter = await Counter.findOneAndUpdate(
    { _id: `agileIssue:${project.key}` },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  this.issueKey = `${project.key}-${counter.seq}`;
});

issueSchema.pre("validate", function () {
  if (this.isNew && this.statusHistory.length === 0) {
    this.statusHistory.push({ status: this.status, changedAt: this.createdAt || new Date() });
  }
  if (this.isNew && this.sprintHistory.length === 0) {
    this.sprintHistory.push({ sprintRef: this.sprintRef, changedAt: this.createdAt || new Date() });
  }
});

export const AgileIssue = mongoose.model("AgileIssue", issueSchema);