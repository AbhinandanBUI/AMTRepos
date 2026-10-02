import { Router } from "express";
import { getProjectAnalyticsAsync } from "../controllers/agile/analytics.controller.js";
import {
  createIssueAsync,
  getIssuesAsync,
  updateIssueAssigneeAsync,
  updateIssueSprintAsync,
  updateIssueStatusAsync,
} from "../controllers/agile/issue.controller.js";
import {
  createProjectAsync,
  getAssignableUsersAsync,
  getProjectsAsync,
  updateProjectMembersAsync,
} from "../controllers/agile/project.controller.js";
import {
  completeSprintAsync,
  createSprintAsync,
  getSprintsAsync,
  startSprintAsync,
} from "../controllers/agile/sprint.controller.js";
import { verifyJWT, verifyPermission } from "../middlewares/auth.middlewares.js";
import { AgileManagementRoles, AgileWorkflowRoles } from "../constants/agile-workflow.js";

const router = Router();
router.use(verifyJWT, verifyPermission(AgileWorkflowRoles));

router.route("/projects").get(getProjectsAsync).post(verifyPermission(AgileManagementRoles), createProjectAsync);
router.get("/users", verifyPermission(AgileManagementRoles), getAssignableUsersAsync);
router.patch("/projects/:projectId/members", verifyPermission(AgileManagementRoles), updateProjectMembersAsync);
router.route("/projects/:projectId/sprints").get(getSprintsAsync).post(verifyPermission(AgileManagementRoles), createSprintAsync);
router.route("/projects/:projectId/issues").get(getIssuesAsync).post(createIssueAsync);
router.get("/projects/:projectId/analytics", getProjectAnalyticsAsync);
router.post("/sprints/:sprintId/start", verifyPermission(AgileManagementRoles), startSprintAsync);
router.post("/sprints/:sprintId/complete", verifyPermission(AgileManagementRoles), completeSprintAsync);
router.patch("/issues/:issueId/status", updateIssueStatusAsync);
router.patch("/issues/:issueId/sprint", updateIssueSprintAsync);
router.patch("/issues/:issueId/assignee", updateIssueAssigneeAsync);

export default router;