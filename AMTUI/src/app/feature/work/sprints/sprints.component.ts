import { Component, inject, OnInit, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { AgileService } from '../agile.service';
import { AgileIssue, AgileProject, AgileSprint, AgileUser, ISSUE_PRIORITIES, IssuePriority } from '../agile.models';

@Component({
  standalone: false,
  selector: 'app-sprints',
  styleUrl: './sprints.component.css',
  templateUrl: './sprints.component.html',
})
export class SprintsComponent implements OnInit {
  private readonly agile = inject(AgileService);
  readonly projects = this.agile.projects;
  readonly assignableUsers = this.agile.assignableUsers;
  readonly selectedProject = this.agile.selectedProject;
  readonly sprints = this.agile.sprints;
  readonly issues = this.agile.issues;
  readonly analytics = this.agile.analytics;
  readonly error = this.agile.error;
  readonly priorities = ISSUE_PRIORITIES;
  readonly selectedSprint = signal<AgileSprint | null>(null);

  showProjectForm = false;
  showSprintForm = false;
  projectName = '';
  projectKey = '';
  projectDescription = '';
  projectMemberIds: string[] = [];
  isSavingMembers = false;
  membersSuccessMessage = '';
  sprintName = '';
  sprintGoal = '';
  sprintStart = '';
  sprintEnd = '';
  issueTitle = '';
  issuePoints = 0;
  issuePriority: IssuePriority = 'Medium';
  issueAssigneeId = '';
  readonly updatingAssigneeIds = new Set<string>();
  targetSprintId = '';

  ngOnInit(): void {
    this.agile.loadAssignableUsers().subscribe();
    this.agile.loadProjects().subscribe({
      next: (projects) => {
        if (projects.length) this.selectProject(projects[0]._id);
      },
    });
  }

  get backlogIssues(): AgileIssue[] {
    return this.issues().filter((issue) => !issue.sprintRef);
  }

  get selectedSprintIssues(): AgileIssue[] {
    const sprintId = this.selectedSprint()?._id;
    return this.issues().filter((issue) => this.getSprintId(issue) === sprintId);
  }

  get plannedSprints(): AgileSprint[] {
    return this.sprints().filter((sprint) => sprint.status === 'Planned');
  }

  selectProject(projectId: string): void {
    const project = this.projects().find((item) => item._id === projectId) || null;
    this.agile.selectedProject.set(project);
    this.selectedSprint.set(null);
    this.projectMemberIds = project?.members.map((member) => this.getUserId(member)) || [];
    this.membersSuccessMessage = '';
    if (!project) {
      this.agile.clearProjectState();
      return;
    }

    forkJoin({
      sprints: this.agile.loadSprints(project._id),
      issues: this.agile.loadIssues(project._id),
      analytics: this.agile.loadAnalytics(project._id),
    }).subscribe({
      next: ({ sprints }) => {
        this.selectedSprint.set(
          sprints.find((sprint) => sprint.status === 'Active') ||
          sprints.find((sprint) => sprint.status === 'Planned') ||
          null
        );
      },
    });
  }

  selectSprint(sprint: AgileSprint): void {
    this.selectedSprint.set(sprint);
  }

  createProject(): void {
    const project = {
      name: this.projectName.trim(),
      key: this.projectKey.trim().toUpperCase(),
      description: this.projectDescription.trim(),
      members: this.projectMemberIds,
    };
    if (!project.name || !project.key) return;

    this.agile.createProject(project).subscribe({
      next: (created) => {
        this.projectName = '';
        this.projectKey = '';
        this.projectDescription = '';
        this.projectMemberIds = created.members.map((member) => this.getUserId(member));
        this.showProjectForm = false;
        this.selectProject(created._id);
      },
    });
  }

  createSprint(): void {
    const project = this.selectedProject();
    if (!project || !this.sprintName.trim() || !this.sprintStart || !this.sprintEnd) return;

    this.agile.createSprint(project._id, {
      name: this.sprintName.trim(),
      sprintGoal: this.sprintGoal.trim(),
      startDate: this.sprintStart,
      endDate: this.sprintEnd,
    }).subscribe({
      next: (created) => {
        this.selectedSprint.set(created);
        this.sprintName = '';
        this.sprintGoal = '';
        this.sprintStart = '';
        this.sprintEnd = '';
        this.showSprintForm = false;
      },
    });
  }

  createBacklogIssue(): void {
    const project = this.selectedProject();
    if (!project || !this.issueTitle.trim()) return;

    this.agile.createIssue(project._id, {
      title: this.issueTitle.trim(),
      description: '',
      status: 'Backlog',
      priority: this.issuePriority,
      storyPoints: Number(this.issuePoints),
      assigneeRef: this.issueAssigneeId || null,
    }).subscribe({
      next: () => {
        this.issueTitle = '';
        this.issuePoints = 0;
        this.issuePriority = 'Medium';
        this.issueAssigneeId = '';
      },
    });
  }

  updateBacklogAssignee(issue: AgileIssue, assigneeId: string): void {
    this.updatingAssigneeIds.add(issue._id);
    this.agile.updateIssueAssignee(issue._id, assigneeId || null).subscribe({
      next: () => this.updatingAssigneeIds.delete(issue._id),
      error: () => this.updatingAssigneeIds.delete(issue._id),
    });
  }

  getAssigneeId(issue: AgileIssue): string {
    return issue.assigneeRef?._id || '';
  }

  assignToSprint(issue: AgileIssue): void {
    const sprint = this.selectedSprint();
    if (!sprint) return;
    this.agile.updateIssueSprint(issue._id, sprint._id).subscribe();
  }

  unassignFromSprint(issue: AgileIssue): void {
    this.agile.updateIssueSprint(issue._id, null).subscribe();
  }

  startSprint(sprint: AgileSprint): void {
    this.agile.startSprint(sprint._id).subscribe({
      next: () => this.refreshProject(),
    });
  }

  completeSprint(sprint: AgileSprint): void {
    this.agile.completeSprint(sprint._id, this.targetSprintId || undefined).subscribe({
      next: () => {
        this.targetSprintId = '';
        this.refreshProject();
      },
    });
  }

  getSprintId(issue: AgileIssue): string | null {
    return typeof issue.sprintRef === 'string' ? issue.sprintRef : issue.sprintRef?._id || null;
  }

  getAssigneeName(issue: AgileIssue): string {
    return issue.assigneeRef?.fullName || 'Unassigned';
  }

  getInitials(name: string): string {
    return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  }

  toggleProjectMember(userId: string, checked: boolean): void {
    this.projectMemberIds = checked
      ? [...new Set([...this.projectMemberIds, userId])]
      : this.projectMemberIds.filter((memberId) => memberId !== userId);
  }

  saveProjectMembers(): void {
    const project = this.selectedProject();
    if (!project) return;
    this.isSavingMembers = true;
    this.membersSuccessMessage = '';
    this.agile.updateProjectMembers(project._id, this.projectMemberIds).subscribe({
      next: (updated) => {
        this.projectMemberIds = updated.members.map((member) => this.getUserId(member));
        this.membersSuccessMessage = 'Project membership saved.';
        this.isSavingMembers = false;
      },
      error: () => this.isSavingMembers = false,
    });
  }

  isMemberSelected(userId: string): boolean {
    return this.projectMemberIds.includes(userId);
  }

  isRequiredProjectMember(project: AgileProject, userId: string): boolean {
    return userId === project.createdBy || userId === this.getUserId(project.lead);
  }

  getProjectMembers(project: AgileProject): AgileUser[] {
    return project.members.filter((member): member is AgileUser => typeof member !== 'string');
  }

  private refreshProject(): void {
    const project = this.selectedProject();
    if (project) this.selectProject(project._id);
  }

  private getUserId(user: AgileUser | string): string {
    return typeof user === 'string' ? user : user._id;
  }
}
