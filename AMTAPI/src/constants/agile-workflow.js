import { UserRolesEnum } from "../constants.js";

export const SprintStatuses = Object.freeze({
  PLANNED: "Planned",
  ACTIVE: "Active",
  COMPLETED: "Completed",
});

export const IssueStatuses = Object.freeze({
  BACKLOG: "Backlog",
  TO_DO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
});

export const IssuePriorities = Object.freeze({
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  BLOCKER: "Blocker",
});

export const AgileWorkflowRoles = Object.freeze([
  UserRolesEnum.ADMIN,
  UserRolesEnum.AGILE_ADMIN,
  UserRolesEnum.SCRUM_MASTER,
  UserRolesEnum.PRODUCT_OWNER,
  UserRolesEnum.DEVELOPER,
]);

export const AgileManagementRoles = Object.freeze([
  UserRolesEnum.ADMIN,
  UserRolesEnum.AGILE_ADMIN,
  UserRolesEnum.SCRUM_MASTER,
  UserRolesEnum.PRODUCT_OWNER,
]);

export const AgileTestUserRoles = Object.freeze([
  UserRolesEnum.AGILE_ADMIN,
  UserRolesEnum.SCRUM_MASTER,
  UserRolesEnum.PRODUCT_OWNER,
  UserRolesEnum.DEVELOPER,
]);