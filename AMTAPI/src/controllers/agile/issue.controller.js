import mongoose from "mongoose";
import { IssuePriorities, IssueStatuses, SprintStatuses } from "../../constants/agile-workflow.js";
import { AgileIssue } from "../../model/agile/issue.model.js";
import { Sprint } from "../../model/agile/sprint.model.js";
import { User } from "../../model/user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getProjectForUser } from "./project.controller.js";

const issuePopulate = [
  { path: "assigneeRef", select: "fullName username avatar" },
  { path: "sprintRef", select: "name status" },
];

export const getIssuesAsync = asyncHandler(async (req, res) => {
  const project = await getProjectForUser(req.params.projectId, req.user._id);
  const filter = { projectRef: project._id };
  if (req.query.sprintId === "backlog") filter.sprintRef = null;
  else if (req.query.sprintId) {
    if (!mongoose.isValidObjectId(req.query.sprintId)) throw new ApiError(400, "Invalid sprint ID");
    filter.sprintRef = req.query.sprintId;
  }
  const result = await AgileIssue.find(filter).populate(issuePopulate).sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, result, "Issues fetched", result.length));
});

export const createIssueAsync = asyncHandler(async (req, res) => {
  const project = await getProjectForUser(req.params.projectId, req.user._id);
  const {
    title,
    description = "",
    status = IssueStatuses.BACKLOG,
    priority = IssuePriorities.MEDIUM,
    storyPoints = 0,
    assigneeRef = null,
    sprintRef = null,
  } = req.body;
  if (!title?.trim()) throw new ApiError(400, "Issue title is required");
  if (!Object.values(IssueStatuses).includes(status)) throw new ApiError(400, "Invalid issue status");
  if (!Object.values(IssuePriorities).includes(priority)) throw new ApiError(400, "Invalid issue priority");
  if (!Number.isFinite(Number(storyPoints)) || Number(storyPoints) < 0 || Number(storyPoints) > 100) {
    throw new ApiError(400, "Story points must be between 0 and 100");
  }
  if (assigneeRef && !mongoose.isValidObjectId(assigneeRef)) throw new ApiError(400, "Invalid assignee ID");
  if (assigneeRef && !(await User.exists({ _id: assigneeRef }))) throw new ApiError(400, "Assignee does not exist");
  if (assigneeRef && !project.members.some((memberId) => String(memberId) === String(assigneeRef)) && String(project.lead) !== String(assigneeRef)) {
    throw new ApiError(400, "Assignee must be a member of this project");
  }

  let sprint = null;
  if (sprintRef) {
    if (!mongoose.isValidObjectId(sprintRef)) throw new ApiError(400, "Invalid sprint ID");
    sprint = await Sprint.findOne({ _id: sprintRef, projectId: project._id, status: { $ne: SprintStatuses.COMPLETED } });
    if (!sprint) throw new ApiError(400, "Sprint must belong to this project and not be completed");
  }

  const issue = await AgileIssue.create({
    projectRef: project._id,
    sprintRef: sprint?._id || null,
    title,
    description,
    status,
    priority,
    storyPoints: Number(storyPoints),
    assigneeRef,
    createdBy: req.user._id,
  });
  await issue.populate(issuePopulate);
  return res.status(201).json(new ApiResponse(201, issue, "Issue created", 1));
});

export const updateIssueStatusAsync = asyncHandler(async (req, res) => {
  const { issueId } = req.params;
  const { status } = req.body;
  if (!mongoose.isValidObjectId(issueId)) throw new ApiError(400, "Invalid issue ID");
  if (!Object.values(IssueStatuses).includes(status)) throw new ApiError(400, "Invalid issue status");
  const issue = await AgileIssue.findById(issueId);
  if (!issue) throw new ApiError(404, "Issue not found");
  await getProjectForUser(issue.projectRef, req.user._id);
  if (issue.status !== status) {
    issue.status = status;
    issue.statusHistory.push({ status, changedAt: new Date() });
    await issue.save();
  }
  await issue.populate(issuePopulate);
  return res.status(200).json(new ApiResponse(200, issue, "Issue status updated", 1));
});

export const updateIssueSprintAsync = asyncHandler(async (req, res) => {
  const { issueId } = req.params;
  const { sprintRef = null } = req.body;
  if (!mongoose.isValidObjectId(issueId)) throw new ApiError(400, "Invalid issue ID");
  const issue = await AgileIssue.findById(issueId);
  if (!issue) throw new ApiError(404, "Issue not found");
  await getProjectForUser(issue.projectRef, req.user._id);
  if (sprintRef) {
    if (!mongoose.isValidObjectId(sprintRef)) throw new ApiError(400, "Invalid sprint ID");
    const sprint = await Sprint.findOne({ _id: sprintRef, projectId: issue.projectRef, status: { $ne: SprintStatuses.COMPLETED } });
    if (!sprint) throw new ApiError(400, "Sprint must belong to this project and not be completed");
  }
  const changedAt = new Date();
  issue.sprintRef = sprintRef;
  issue.sprintHistory.push({ sprintRef, changedAt });
  const nextStatus = sprintRef ? IssueStatuses.TO_DO : IssueStatuses.BACKLOG;
  if (issue.status === IssueStatuses.BACKLOG || (!sprintRef && issue.status === IssueStatuses.TO_DO)) {
    issue.status = nextStatus;
    issue.statusHistory.push({ status: nextStatus, changedAt });
  }
  await issue.save();
  await issue.populate(issuePopulate);
  return res.status(200).json(new ApiResponse(200, issue, "Issue sprint updated", 1));
});

export const updateIssueAssigneeAsync = asyncHandler(async (req, res) => {
  const { issueId } = req.params;
  const { assigneeRef = null } = req.body;
  if (!mongoose.isValidObjectId(issueId)) throw new ApiError(400, "Invalid issue ID");

  const issue = await AgileIssue.findById(issueId);
  if (!issue) throw new ApiError(404, "Issue not found");
  const project = await getProjectForUser(issue.projectRef, req.user._id);

  if (assigneeRef !== null) {
    if (!mongoose.isValidObjectId(assigneeRef)) throw new ApiError(400, "Invalid assignee ID");
    const isProjectMember = project.members.some((memberId) => String(memberId) === String(assigneeRef)) ||
      String(project.lead) === String(assigneeRef) || String(project.createdBy) === String(assigneeRef);
    if (!isProjectMember) throw new ApiError(400, "Assignee must be a member of this project");

    const activeUser = await User.exists({ _id: assigneeRef, isActive: true });
    if (!activeUser) throw new ApiError(400, "Assignee must be an active user");
  }

  issue.assigneeRef = assigneeRef;
  await issue.save();
  await issue.populate(issuePopulate);
  return res.status(200).json(new ApiResponse(200, issue, "Issue assignee updated", 1));
});