import { Component, inject, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../services/StorageServices/auth-service.service';
import { AgileService } from '../agile.service';
import { AgileIssue, AgileProject, AgileSprint } from '../agile.models';

@Component({
  standalone: false,
  selector: 'app-backlogs',
  styleUrl: './backlogs.component.css',
  templateUrl: './backlogs.component.html',
})
export class BacklogsComponent implements OnInit {
  private readonly agile = inject(AgileService);
  private readonly auth = inject(AuthService);
  readonly projects = this.agile.projects;
  readonly issues = this.agile.issues;
  readonly sprints = this.agile.sprints;
  readonly error = this.agile.error;

  selectedProjectId = '';
  selectedSprintId = '';
  searchText = '';
  assignedToMeOnly = true;
  isLoading = false;
  isAssigningIssueId: string | null = null;

  ngOnInit(): void {
    this.isLoading = true;
    debugger;
    this.agile.loadProjects().subscribe({
      next: (projects) => {
        const firstProject = projects[0];
        if (!firstProject) {
          this.isLoading = false;
          return;
        }
        this.selectProject(firstProject._id);
      },
      error: () => this.isLoading = false,
    });
  }

  get currentUserId(): string {
    return this.auth.user()?.id || '';
  }

  get selectedProject(): AgileProject | undefined {
    return this.projects().find((project) => project._id === this.selectedProjectId);
  }

  get availableSprints(): AgileSprint[] {
    return this.sprints().filter((sprint) => sprint.status !== 'Completed');
  }

  get backlogIssues(): AgileIssue[] {
    const search = this.searchText.trim().toLowerCase();
    debugger;
    return this.issues().filter((issue) => {
      const inBacklog = !this.getSprintId(issue);
      const assignedToMe = this.getAssigneeId(issue) === this.currentUserId;
      const matchesOwner = !this.assignedToMeOnly || assignedToMe;
      const matchesSearch = !search || `${issue.issueKey} ${issue.title}`.toLowerCase().includes(search);
      return inBacklog && matchesOwner && matchesSearch;
    });
  }

  get assignedBacklogCount(): number {
    return this.issues().filter((issue) =>
      !this.getSprintId(issue) && this.getAssigneeId(issue) === this.currentUserId
    ).length;
  }

  selectProject(projectId: string): void {
    this.selectedProjectId = projectId;
    this.selectedSprintId = '';
    this.isLoading = true;
    this.agile.selectedProject.set(this.projects().find((project) => project._id === projectId) || null);
    if (!projectId) {
      this.isLoading = false;
      return;
    }

    forkJoin({
      issues: this.agile.loadIssues(projectId),
      sprints: this.agile.loadSprints(projectId),
    }).subscribe({
      next: ({ sprints }) => {
        this.selectedSprintId = sprints.find((sprint) => sprint.status === 'Active')?._id ||
          sprints.find((sprint) => sprint.status === 'Planned')?._id || '';
        this.isLoading = false;
      },
      error: () => this.isLoading = false,
    });
  }

  assignToSprint(issue: AgileIssue): void {
    if (!this.selectedSprintId) return;
    this.isAssigningIssueId = issue._id;
    this.agile.updateIssueSprint(issue._id, this.selectedSprintId).subscribe({
      next: () => this.isAssigningIssueId = null,
      error: () => this.isAssigningIssueId = null,
    });
  }

  getAssigneeName(issue: AgileIssue): string {
    return issue.assigneeRef?.fullName || 'Unassigned';
  }

  private getAssigneeId(issue: AgileIssue): string | null {
    return issue.assigneeRef?._id || null;
  }

  private getSprintId(issue: AgileIssue): string | null {
    return typeof issue.sprintRef === 'string' ? issue.sprintRef : issue.sprintRef?._id || null;
  }
}



