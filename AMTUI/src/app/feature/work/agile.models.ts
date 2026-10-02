export const SPRINT_STATUSES = ['Planned', 'Active', 'Completed'] as const;
export type SprintStatus = (typeof SPRINT_STATUSES)[number];

export const ISSUE_STATUSES = ['Backlog', 'To Do', 'In Progress', 'In Review', 'Done'] as const;
export type IssueStatus = (typeof ISSUE_STATUSES)[number];

export const ISSUE_PRIORITIES = ['Low', 'Medium', 'High', 'Blocker'] as const;
export type IssuePriority = (typeof ISSUE_PRIORITIES)[number];

export const AGILE_WORKFLOW_ROLES = ['ADMIN', 'Admin', 'ScrumMaster', 'ProductOwner', 'Developer'] as const;
export const AGILE_MANAGEMENT_ROLES = ['ADMIN', 'Admin', 'ScrumMaster', 'ProductOwner'] as const;
export const TEST_USER_ADMIN_ROLES = ['ADMIN', 'Admin'] as const;

export interface AgileUser {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  role: string;
  avatar?: { url?: string };
}

export interface AgileProject {
  _id: string;
  name: string;
  key: string;
  description: string;
  lead: AgileUser | string;
  members: Array<AgileUser | string>;
  createdBy: string;
}

export interface AgileSprint {
  _id: string;
  projectId: string;
  name: string;
  sprintGoal: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
}

export interface AgileIssue {
  _id: string;
  issueKey: string;
  projectRef: string;
  sprintRef: AgileSprint | string | null;
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  storyPoints: number;
  assigneeRef: AgileUser | null;
}

export interface AgileAnalytics {
  velocity: Array<{ sprintId: string; name: string; completedPoints: number }>;
  burndown: null | {
    sprintId: string;
    totalPoints: number;
    days: Array<{ date: string; remainingPoints: number; idealRemainingPoints: number }>;
  };
}

export type CreateProjectRequest = Pick<AgileProject, 'name' | 'key' | 'description'> & { members: string[] };
export type CreateSprintRequest = Pick<AgileSprint, 'name' | 'sprintGoal' | 'startDate' | 'endDate'>;
export type CreateIssueRequest = Pick<AgileIssue, 'title' | 'description' | 'status' | 'priority' | 'storyPoints'> & {
  assigneeRef?: string | null;
  sprintRef?: string | null;
};