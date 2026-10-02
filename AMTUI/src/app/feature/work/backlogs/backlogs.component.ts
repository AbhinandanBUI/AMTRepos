import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../services/StorageServices/auth-service.service';
import { AgileService } from '../agile.service';
import { AgileIssue, AgileProject, AgileSprint } from '../agile.models';
import { ToastService } from '../../../services/toast.service';

@Component({
  standalone: false,
  selector: 'app-backlogs',
  styleUrl: './backlogs.component.css',
  templateUrl: './backlogs.component.html',
})
export class BacklogsComponent implements OnInit {
  private readonly agile = inject(AgileService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  readonly projects = this.agile.projects;
  readonly issues = this.agile.issues;
  readonly sprints = this.agile.sprints;
  readonly error = this.agile.error;

  readonly selectedProjectId = signal('');
  readonly selectedSprintId = signal('');
  readonly searchText = signal('');
  readonly assignedToMeOnly = signal(true);
  readonly isLoading = signal(false);
  readonly isAssigningIssueId = signal<string | null>(null);
  readonly currentUserId = computed(() => this.auth.user()?.id || '');
  readonly selectedProject = computed(() =>
    this.projects().find((project) => project._id === this.selectedProjectId())
  );
  readonly availableSprints = computed(() =>
    this.sprints().filter((sprint) => sprint.status !== 'Completed')
  );
  readonly backlogIssues = computed(() => {
    const search = this.searchText().trim().toLowerCase();
    return this.issues().filter((issue) => {
      const inBacklog = !this.getSprintId(issue);
      const assignedToMe = this.getAssigneeId(issue) === this.currentUserId();
      const matchesOwner = !this.assignedToMeOnly() || assignedToMe;
      const matchesSearch = !search || `${issue.issueKey} ${issue.title}`.toLowerCase().includes(search);
      return inBacklog && matchesOwner && matchesSearch;
    });
  });
  readonly assignedBacklogCount = computed(() =>
    this.issues().filter((issue) =>
      !this.getSprintId(issue) && this.getAssigneeId(issue) === this.currentUserId()
    ).length
  );

  ngOnInit(): void {
    this.isLoading.set(true);
    this.agile.loadProjects().subscribe({
      next: (projects) => {
        const firstProject = projects[0];
        if (!firstProject) {
          this.isLoading.set(false);
          return;
        }
        this.selectProject(firstProject._id);
      },
      error: () => this.isLoading.set(false),
    });
  }

  selectProject(projectId: string): void {
    this.selectedProjectId.set(projectId);
    this.selectedSprintId.set('');
    this.isLoading.set(true);
    this.agile.selectedProject.set(this.projects().find((project) => project._id === projectId) || null);
    if (!projectId) {
      this.isLoading.set(false);
      return;
    }

    forkJoin({
      issues: this.agile.loadIssues(projectId),
      sprints: this.agile.loadSprints(projectId),
    }).subscribe({
      next: ({ sprints }) => {
        this.selectedSprintId.set(sprints.find((sprint) => sprint.status === 'Active')?._id ||
          sprints.find((sprint) => sprint.status === 'Planned')?._id || '');
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  assignToSprint(issue: AgileIssue): void {
    const sprintId = this.selectedSprintId();
    if (!sprintId) return;
    this.isAssigningIssueId.set(issue._id);
    this.agile.updateIssueSprint(issue._id, sprintId).subscribe({
      next: () => {
        this.isAssigningIssueId.set(null);
        this.toast.success(`${issue.issueKey} added to the selected sprint.`, 'Backlog updated');
      },
      error: () => this.isAssigningIssueId.set(null),
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



