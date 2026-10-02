import { IssueStatuses, SprintStatuses } from "../../constants/agile-workflow.js";
import { AgileIssue } from "../../model/agile/issue.model.js";
import { Sprint } from "../../model/agile/sprint.model.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getProjectForUser } from "./project.controller.js";

const dayMilliseconds = 24 * 60 * 60 * 1000;

export const getProjectAnalyticsAsync = asyncHandler(async (req, res) => {
  const project = await getProjectForUser(req.params.projectId, req.user._id);
  const completedSprints = await Sprint.find({ projectId: project._id, status: SprintStatuses.COMPLETED })
    .sort({ endDate: -1 })
    .limit(5)
    .select("name startDate endDate");

  const velocityRows = await AgileIssue.aggregate([
    { $match: { projectRef: project._id, sprintRef: { $in: completedSprints.map((sprint) => sprint._id) }, status: IssueStatuses.DONE } },
    { $group: { _id: "$sprintRef", storyPoints: { $sum: "$storyPoints" } } },
  ]);
  const velocityBySprint = new Map(velocityRows.map((row) => [String(row._id), row.storyPoints]));
  const velocity = completedSprints
    .slice()
    .reverse()
    .map((sprint) => ({
      sprintId: sprint._id,
      name: sprint.name,
      completedPoints: velocityBySprint.get(String(sprint._id)) || 0,
    }));

  const activeSprint = await Sprint.findOne({ projectId: project._id, status: SprintStatuses.ACTIVE });
  let burndown = null;
  if (activeSprint) {
    const issues = await AgileIssue.aggregate([
      { $match: { projectRef: project._id, "sprintHistory.sprintRef": activeSprint._id } },
      { $unwind: "$statusHistory" },
      { $sort: { "statusHistory.changedAt": 1 } },
      {
        $group: {
          _id: {
            issueId: "$_id",
            day: { $dateTrunc: { date: "$statusHistory.changedAt", unit: "day", timezone: "UTC" } },
          },
          storyPoints: { $first: "$storyPoints" },
          status: { $last: "$statusHistory.status" },
          changedAt: { $last: "$statusHistory.changedAt" },
          sprintHistory: { $first: "$sprintHistory" },
        },
      },
      { $sort: { "_id.day": 1 } },
      {
        $group: {
          _id: "$_id.issueId",
          storyPoints: { $first: "$storyPoints" },
          statusHistory: { $push: { status: "$status", changedAt: "$changedAt" } },
          sprintHistory: { $first: "$sprintHistory" },
        },
      },
      { $project: { _id: 1, storyPoints: 1, statusHistory: 1, sprintHistory: 1 } },
    ]);
    const start = new Date(activeSprint.startDate);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(activeSprint.endDate);
    end.setUTCHours(0, 0, 0, 0);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const lastDay = Math.min(+end, +today);
    const sprintStartEnd = +start + dayMilliseconds - 1;
    const totalPoints = issues.reduce((sum, issue) => {
      const sprintAtStart = issue.sprintHistory
        .filter((entry) => +new Date(entry.changedAt) <= sprintStartEnd)
        .sort((left, right) => +new Date(right.changedAt) - +new Date(left.changedAt))[0]?.sprintRef;
      return String(sprintAtStart || "") === String(activeSprint._id)
        ? sum + issue.storyPoints
        : sum;
    }, 0);
    const totalDays = Math.max(1, Math.round((+end - +start) / dayMilliseconds));
    const days = [];

    for (let date = +start; date <= lastDay; date += dayMilliseconds) {
      const dayEnd = date + dayMilliseconds - 1;
      let remainingPoints = 0;
      for (const issue of issues) {
        const latestStatus = issue.statusHistory
          .filter((entry) => +new Date(entry.changedAt) <= dayEnd)
          .sort((left, right) => +new Date(right.changedAt) - +new Date(left.changedAt))[0]?.status;
        const latestSprint = issue.sprintHistory
          .filter((entry) => +new Date(entry.changedAt) <= dayEnd)
          .sort((left, right) => +new Date(right.changedAt) - +new Date(left.changedAt))[0]?.sprintRef;
        if (latestStatus && String(latestSprint || "") === String(activeSprint._id) && latestStatus !== IssueStatuses.DONE) {
          remainingPoints += issue.storyPoints;
        }
      }
      const elapsedDays = Math.max(0, Math.round((date - +start) / dayMilliseconds));
      days.push({
        date: new Date(date).toISOString().slice(0, 10),
        remainingPoints,
        idealRemainingPoints: Math.max(0, totalPoints * (1 - elapsedDays / totalDays)),
      });
    }
    burndown = { sprintId: activeSprint._id, totalPoints, days };
  }

  return res.status(200).json(new ApiResponse(200, { velocity, burndown }, "Agile analytics fetched", velocity.length));
});