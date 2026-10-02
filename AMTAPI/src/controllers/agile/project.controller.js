import mongoose from "mongoose";
import { Project } from "../../model/agile/project.model.js";
import { User } from "../../model/user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getProjectsAsync = asyncHandler(async (req, res) => {
  const result = await Project.find({
    isActive: true,
    $or: [{ createdBy: req.user._id }, { lead: req.user._id }, { members: req.user._id }],
  })
    .populate("lead", "fullName username avatar")
    .populate("members", "fullName username email role avatar")
    .sort({ name: 1 });

  return res.status(200).json(new ApiResponse(200, result, "Projects fetched", result.length));
});

export const createProjectAsync = asyncHandler(async (req, res) => {
  const { name, key, description = "", members = [], lead } = req.body;
  if (!name?.trim() || !key?.trim()) {
    throw new ApiError(400, "Project name and key are required");
  }
  if (!Array.isArray(members) || members.some((id) => !mongoose.isValidObjectId(id))) {
    throw new ApiError(400, "Project members must be valid user IDs");
  }
  if (lead && !mongoose.isValidObjectId(lead)) {
    throw new ApiError(400, "Project lead must be a valid user ID");
  }

  const leadId = lead || req.user._id;
  const requiredMemberIds = [String(leadId), String(req.user._id)];
  const selectedMemberIds = [...new Set(members.map(String))]
    .filter((memberId) => !requiredMemberIds.includes(memberId));
  const activeMemberCount = await User.countDocuments({ _id: { $in: selectedMemberIds }, isActive: true });
  if (activeMemberCount !== selectedMemberIds.length) throw new ApiError(400, "Selected project members must be active users");
  const memberIds = [...new Set([...selectedMemberIds, ...requiredMemberIds])];
  const project = await Project.create({
    name,
    key,
    description,
    lead: leadId,
    members: memberIds,
    createdBy: req.user._id,
  });

  await project.populate("members", "fullName username email role avatar");
  await project.populate("lead", "fullName username avatar");
  return res.status(201).json(new ApiResponse(201, project, "Project created", 1));
});

export const getAssignableUsersAsync = asyncHandler(async (_req, res) => {
  const users = await User.find({ isActive: true })
    .select("fullName username email role avatar")
    .sort({ fullName: 1 });
  return res.status(200).json(new ApiResponse(200, users, "Active users fetched", users.length));
});

export const updateProjectMembersAsync = asyncHandler(async (req, res) => {
  const project = await getProjectForUser(req.params.projectId, req.user._id);
  const { members } = req.body;
  if (!Array.isArray(members) || members.some((userId) => !mongoose.isValidObjectId(userId))) {
    throw new ApiError(400, "Project members must be an array of valid user IDs");
  }

  const requiredMemberIds = [String(project.lead), String(project.createdBy)];
  const selectedMemberIds = [...new Set(members.map(String))]
    .filter((memberId) => !requiredMemberIds.includes(memberId));
  const activeMemberCount = await User.countDocuments({ _id: { $in: selectedMemberIds }, isActive: true });
  if (activeMemberCount !== selectedMemberIds.length) throw new ApiError(400, "Selected project members must be active users");
  const memberIds = [...new Set([...selectedMemberIds, ...requiredMemberIds])];

  project.members = memberIds;
  await project.save();
  await project.populate("members", "fullName username email role avatar");
  await project.populate("lead", "fullName username avatar");
  return res.status(200).json(new ApiResponse(200, project, "Project members updated", memberIds.length));
});

export const getProjectForUser = async (projectId, userId) => {
  if (!mongoose.isValidObjectId(projectId)) throw new ApiError(400, "Invalid project ID");
  const project = await Project.findOne({
    _id: projectId,
    isActive: true,
    $or: [{ createdBy: userId }, { lead: userId }, { members: userId }],
  });
  if (!project) throw new ApiError(404, "Project not found");
  return project;
};