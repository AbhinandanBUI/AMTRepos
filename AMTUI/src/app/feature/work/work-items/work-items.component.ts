import { Component, inject, OnInit } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { AgileService } from '../agile.service';
import { AgileIssue, AgileSprint, AgileUser, ISSUE_PRIORITIES, ISSUE_STATUSES, IssuePriority, IssueStatus } from '../agile.models';



@Component({
  standalone: false,
  selector: 'app-work-items',
  styleUrl: './work-items.component.css',
  templateUrl: './work-items.component.html',
})
export class WorkItemsComponent implements OnInit {
  private readonly agile = inject(AgileService);
  readonly projects = this.agile.projects;
  readonly selectedProject = this.agile.selectedProject;
  readonly issues = this.agile.issues;
  readonly error = this.agile.error;
  readonly statuses = ISSUE_STATUSES;
  readonly priorities = ISSUE_PRIORITIES;

  selectedProjectId = '';
  searchText = '';
  statusFilter = '';
  priorityFilter = '';
  isLoading = false;
  isCreating = false;
  creationError = '';
  formOpen = false;
  readonly busyIssueIds = new Set<string>();
  newTitle = '';
  newDescription = '';
  newPriority: IssuePriority = 'Medium';
  newStoryPoints = 0;
  newAssigneeId = '';
  newSprintId = '';

  ngOnInit(): void {
    this.isLoading = true;
    this.agile.loadProjects().subscribe({
      next: (projects) => {
        if (!projects.length) {
          this.isLoading = false;
          return;
        }
        this.selectProject(projects[0]._id);
      },
      error: () => this.isLoading = false,
    });
  }

  get sprints(): AgileSprint[] {
    return this.agile.sprints().filter((sprint) => sprint.status !== 'Completed');
  }

  get projectMembers(): AgileUser[] {
    return this.selectedProject()?.members.filter((member): member is AgileUser => typeof member !== 'string') || [];
  }

  get filteredIssues(): AgileIssue[] {
    const query = this.searchText.trim().toLowerCase();
    return this.issues().filter((issue) => {
      const matchesQuery = !query || `${issue.issueKey} ${issue.title}`.toLowerCase().includes(query);
      const matchesStatus = !this.statusFilter || issue.status === this.statusFilter;
      const matchesPriority = !this.priorityFilter || issue.priority === this.priorityFilter;
      return matchesQuery && matchesStatus && matchesPriority;
    });
  }

  selectProject(projectId: string): void {
    this.selectedProjectId = projectId;
    const project = this.projects().find((item) => item._id === projectId) || null;
    this.agile.selectedProject.set(project);
    this.isLoading = true;
    if (!project) {
      this.agile.clearProjectState();
      this.isLoading = false;
      return;
    }

    forkJoin({
      issues: this.agile.loadIssues(projectId),
      sprints: this.agile.loadSprints(projectId),
    }).subscribe({
      next: () => this.isLoading = false,
      error: () => this.isLoading = false,
    });
  }

  createIssue(): void {
    const project = this.selectedProject();
    const title = this.newTitle.trim();
    if (!project || !title || this.newStoryPoints < 0 || this.newStoryPoints > 100) return;

    this.isCreating = true;
    this.creationError = '';
    this.agile.createIssue(project._id, {
      title,
      description: this.newDescription.trim(),
      status: this.newSprintId ? 'To Do' : 'Backlog',
      priority: this.newPriority,
      storyPoints: Number(this.newStoryPoints),
      assigneeRef: this.newAssigneeId || null,
      sprintRef: this.newSprintId || null,
    }).subscribe({
      next: () => {
        this.newTitle = '';
        this.newDescription = '';
        this.newPriority = 'Medium';
        this.newStoryPoints = 0;
        this.newAssigneeId = '';
        this.newSprintId = '';
        this.formOpen = false;
        this.isCreating = false;
      },
      error: () => {
        this.creationError = this.error();
        this.isCreating = false;
      },
    });
  }

  updateStatus(issue: AgileIssue, status: IssueStatus): void {
    this.runIssueUpdate(issue, () => this.agile.updateIssueStatus(issue._id, status));
  }

  updateAssignee(issue: AgileIssue, assigneeRef: string): void {
    this.runIssueUpdate(issue, () => this.agile.updateIssueAssignee(issue._id, assigneeRef || null));
  }

  updateSprint(issue: AgileIssue, sprintRef: string): void {
    this.runIssueUpdate(issue, () => this.agile.updateIssueSprint(issue._id, sprintRef || null));
  }

  isBusy(issue: AgileIssue): boolean {
    return this.busyIssueIds.has(issue._id);
  }

  getAssigneeName(issue: AgileIssue): string {
    return issue.assigneeRef?.fullName || 'Unassigned';
  }

  getSprintName(issue: AgileIssue): string {
    return typeof issue.sprintRef === 'string' ? 'In sprint' : issue.sprintRef?.name || 'Backlog';
  }

  getSprintId(issue: AgileIssue): string {
    return typeof issue.sprintRef === 'string' ? issue.sprintRef : issue.sprintRef?._id || '';
  }

  private runIssueUpdate(issue: AgileIssue, update: () => Observable<AgileIssue>): void {
    this.busyIssueIds.add(issue._id);
    update().subscribe({
      next: () => this.busyIssueIds.delete(issue._id),
      error: () => this.busyIssueIds.delete(issue._id),
    });
  }

}
