import mongoose from "mongoose";
import { IssueStatuses, SprintStatuses } from "../../constants/agile-workflow.js";
import { AgileIssue } from "../../model/agile/issue.model.js";
import { Project } from "../../model/agile/project.model.js";
import { Sprint } from "../../model/agile/sprint.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getProjectForUser } from "./project.controller.js";

export const getSprintsAsync = asyncHandler(async (req, res) => {
  const project = await getProjectForUser(req.params.projectId, req.user._id);
  const result = await Sprint.find({ projectId: project._id }).sort({ startDate: -1 });
  return res.status(200).json(new ApiResponse(200, result, "Sprints fetched", result.length));
});

export const createSprintAsync = asyncHandler(async (req, res) => {
  const project = await getProjectForUser(req.params.projectId, req.user._id);
  const { name, sprintGoal = "", startDate, endDate } = req.body;
  const parsedStart = new Date(startDate);
  const parsedEnd = new Date(endDate);
  if (!name?.trim() || !startDate || !endDate || Number.isNaN(+parsedStart) || Number.isNaN(+parsedEnd)) {
    throw new ApiError(400, "Sprint name, start date, and end date are required");
  }
  if (parsedEnd < parsedStart) throw new ApiError(400, "Sprint end date must be on or after its start date");

  const sprint = await Sprint.create({
    projectId: project._id,
    name,
    sprintGoal,
    startDate: parsedStart,
    endDate: parsedEnd,
    createdBy: req.user._id,
  });
  return res.status(201).json(new ApiResponse(201, sprint, "Sprint created", 1));
});

export const startSprintAsync = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.sprintId)) throw new ApiError(400, "Invalid sprint ID");
  const sprint = await Sprint.findById(req.params.sprintId);
  if (!sprint) throw new ApiError(404, "Sprint not found");
  await getProjectForUser(sprint.projectId, req.user._id);
  if (sprint.status !== SprintStatuses.PLANNED) throw new ApiError(409, "Only planned sprints can be started");

  try {
    const projectLock = await Project.findOneAndUpdate(
      { _id: sprint.projectId, activeSprint: null },
      { $set: { activeSprint: sprint._id } },
      { new: true }
    );
    if (!projectLock) throw new ApiError(409, "Another sprint is already active for this project");

    const started = await Sprint.findOneAndUpdate(
      { _id: sprint._id, status: SprintStatuses.PLANNED },
      { $set: { status: SprintStatuses.ACTIVE } },
      { new: true, runValidators: true }
    );
    if (!started) {
      await Project.updateOne({ _id: sprint.projectId, activeSprint: sprint._id }, { $set: { activeSprint: null } });
      throw new ApiError(409, "Sprint status changed; refresh and try again");
    }
    return res.status(200).json(new ApiResponse(200, started, "Sprint started", 1));
  } catch (error) {
    await Project.updateOne({ _id: sprint.projectId, activeSprint: sprint._id }, { $set: { activeSprint: null } });
    if (error?.code === 11000) throw new ApiError(409, "Another sprint is already active for this project");
    throw error;
  }
});

export const completeSprintAsync = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.sprintId)) throw new ApiError(400, "Invalid sprint ID");
  const sprint = await Sprint.findById(req.params.sprintId);
  if (!sprint) throw new ApiError(404, "Sprint not found");
  await getProjectForUser(sprint.projectId, req.user._id);
  if (sprint.status !== SprintStatuses.ACTIVE) throw new ApiError(409, "Only active sprints can be completed");

  const { targetSprintId } = req.body;
  let targetSprint = null;
  if (targetSprintId) {
    if (!mongoose.isValidObjectId(targetSprintId) || String(targetSprintId) === String(sprint._id)) {
      throw new ApiError(400, "Invalid target sprint");
    }
    targetSprint = await Sprint.findOne({
      _id: targetSprintId,
      projectId: sprint.projectId,
      status: SprintStatuses.PLANNED,
    });
    if (!targetSprint) throw new ApiError(400, "Target sprint must be planned in the same project");
  }

  const changedAt = new Date();
  await AgileIssue.updateMany(
    { sprintRef: sprint._id, status: { $ne: IssueStatuses.DONE } },
    {
      $set: { sprintRef: targetSprint?._id || null },
      $push: { sprintHistory: { sprintRef: targetSprint?._id || null, changedAt } },
    }
  );
  const completed = await Sprint.findOneAndUpdate(
    { _id: sprint._id, status: SprintStatuses.ACTIVE },
    { $set: { status: SprintStatuses.COMPLETED } },
    { new: true }
  );
  if (!completed) throw new ApiError(409, "Sprint status changed; refresh and try again");
  await Project.updateOne(
    { _id: sprint.projectId, activeSprint: sprint._id },
    { $set: { activeSprint: null } }
  );

  return res.status(200).json(new ApiResponse(200, completed, "Sprint completed", 1));
});