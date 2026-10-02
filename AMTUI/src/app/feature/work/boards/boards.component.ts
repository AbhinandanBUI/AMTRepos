import { Component, inject, OnInit } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { forkJoin } from 'rxjs';
import { AgileService } from '../agile.service';
import { AgileIssue, AgileProject, AgileSprint, AgileUser, ISSUE_PRIORITIES, ISSUE_STATUSES, IssueStatus } from '../agile.models';
import { ToastService } from '../../../services/toast.service';

@Component({
  standalone: false,
  selector: 'app-boards',
  styleUrl: './boards.component.css',
  templateUrl: './boards.component.html',
})
export class BoardsComponent implements OnInit {
  private readonly agile = inject(AgileService);
  private readonly toast = inject(ToastService);
  readonly projects = this.agile.projects;
  readonly selectedProject = this.agile.selectedProject;
  readonly sprints = this.agile.sprints;
  readonly issues = this.agile.issues;
  readonly error = this.agile.error;
  readonly priorities = ISSUE_PRIORITIES;
  readonly lanes = ISSUE_STATUSES.filter((status) => status !== 'Backlog');
  selectedProjectId = '';
  selectedSprintId = '';
  searchText = '';
  priorityFilter = '';

  ngOnInit(): void {
    this.agile.loadProjects().subscribe({
      next: (projects) => {
        if (projects.length) this.selectProject(projects[0]._id);
      },
    });
  }

  get selectedSprint(): AgileSprint | undefined {
    return this.sprints().find((sprint) => sprint._id === this.selectedSprintId);
  }

  get cardsByLane(): Array<{
    status: IssueStatus;
    count: number;
    buckets: Array<{ id: string; name: string; issues: AgileIssue[] }>;
  }> {
    const query = this.searchText.trim().toLowerCase();
    return this.lanes.map((status) => {
      const buckets = [
        ...this.getProjectMembers(this.selectedProject()).map((member) => ({
          id: member._id,
          name: member.fullName,
          issues: this.issuesForBucket(status, member._id, query),
        })),
        { id: 'unassigned', name: 'Unassigned', issues: this.issuesForBucket(status, null, query) },
      ];
      return { status, buckets, count: buckets.reduce((total, bucket) => total + bucket.issues.length, 0) };
    });
  }

  getProjectMembers(project: AgileProject | null): AgileUser[] {
    return project?.members.filter((member): member is AgileUser => typeof member !== 'string') || [];
  }

  selectProject(projectId: string): void {
    this.selectedProjectId = projectId;
    this.selectedSprintId = '';
    const project = this.projects().find((item) => item._id === projectId) || null;
    this.agile.selectedProject.set(project);
    if (!project) {
      this.agile.clearProjectState();
      return;
    }

    forkJoin({
      sprints: this.agile.loadSprints(project._id),
      issues: this.agile.loadIssues(project._id),
    }).subscribe({
      next: ({ sprints }) => {
        const selected = sprints.find((sprint) => sprint.status === 'Active') ||
          sprints.find((sprint) => sprint.status === 'Planned');
        this.selectedSprintId = selected?._id || '';
      },
    });
  }

  selectSprint(sprintId: string): void {
    this.selectedSprintId = sprintId;
  }

  dropIssue(event: CdkDragDrop<AgileIssue[]>, status: IssueStatus): void {
    if (event.previousContainer === event.container) return;
    const issue = event.item.data as AgileIssue;
    this.agile.updateIssueStatus(issue._id, status).subscribe({
      next: () => this.toast.success(`${issue.issueKey} moved to ${status}.`, 'Status updated'),
      error: () => this.reloadIssues(),
    });
  }

  getAssigneeName(issue: AgileIssue): string {
    return issue.assigneeRef?.fullName || 'Unassigned';
  }

  getInitials(name: string): string {
    return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  }

  private getSprintId(issue: AgileIssue): string | null {
    return typeof issue.sprintRef === 'string' ? issue.sprintRef : issue.sprintRef?._id || null;
  }

  private getAssigneeId(issue: AgileIssue): string | null {
    return issue.assigneeRef?._id || null;
  }

  private issuesForBucket(status: IssueStatus, assigneeId: string | null, query: string): AgileIssue[] {
    return this.issues().filter((issue) => {
      const inSelectedSprint = this.getSprintId(issue) === this.selectedSprintId;
      const matchesStatus = issue.status === status;
      const matchesAssignee = this.getAssigneeId(issue) === assigneeId;
      const matchesQuery = !query || `${issue.issueKey} ${issue.title}`.toLowerCase().includes(query);
      const matchesPriority = !this.priorityFilter || issue.priority === this.priorityFilter;
      return inSelectedSprint && matchesStatus && matchesAssignee && matchesQuery && matchesPriority;
    });
  }

  private reloadIssues(): void {
    if (this.selectedProjectId) this.agile.loadIssues(this.selectedProjectId).subscribe();
  }
}
