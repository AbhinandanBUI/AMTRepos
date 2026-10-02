import { Injectable, signal } from '@angular/core';
import { APIResponse } from '../../core/app-type-defination';
import { App_API_Endpoints } from '../../core/app-api-endpoints';
import { MasterAPIService } from '../../services/master-api.service';
import {
  AgileAnalytics,
  AgileIssue,
  AgileProject,
  AgileSprint,
  AgileUser,
  CreateIssueRequest,
  CreateProjectRequest,
  CreateSprintRequest,
  IssueStatus,
} from './agile.models';
import { Observable, catchError, map, tap, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AgileService {
  readonly projects = signal<AgileProject[]>([]);
  readonly assignableUsers = signal<AgileUser[]>([]);
  readonly selectedProject = signal<AgileProject | null>(null);
  readonly sprints = signal<AgileSprint[]>([]);
  readonly issues = signal<AgileIssue[]>([]);
  readonly analytics = signal<AgileAnalytics | null>(null);
  readonly error = signal('');

  constructor(private readonly api: MasterAPIService) {}

  loadProjects(): Observable<AgileProject[]> {
    return this.request<AgileProject[]>(this.api.get(App_API_Endpoints.agile.projects)).pipe(
      tap((projects) => this.projects.set(projects))
    );
  }

  createProject(project: CreateProjectRequest): Observable<AgileProject> {
    return this.request<AgileProject>(this.api.post(App_API_Endpoints.agile.projects, project)).pipe(
      tap((created) => this.projects.update((projects) => [...projects, created]))
    );
  }

  loadAssignableUsers(): Observable<AgileUser[]> {
    return this.request<AgileUser[]>(this.api.get(App_API_Endpoints.agile.users)).pipe(
      tap((users) => this.assignableUsers.set(users))
    );
  }

  updateProjectMembers(projectId: string, members: string[]): Observable<AgileProject> {
    return this.request<AgileProject>(
      this.api.patch<APIResponse, { members: string[] }>(
        App_API_Endpoints.agile.projectMembers(projectId),
        { members }
      )
    ).pipe(tap((updated) => {
      this.projects.update((projects) => projects.map((project) => project._id === updated._id ? updated : project));
      this.selectedProject.set(updated);
    }));
  }

  loadSprints(projectId: string): Observable<AgileSprint[]> {
    return this.request<AgileSprint[]>(this.api.get(App_API_Endpoints.agile.projectSprints(projectId))).pipe(
      tap((sprints) => this.sprints.set(sprints))
    );
  }

  createSprint(projectId: string, sprint: CreateSprintRequest): Observable<AgileSprint> {
    return this.request<AgileSprint>(
      this.api.post(App_API_Endpoints.agile.projectSprints(projectId), sprint)
    ).pipe(tap((created) => this.sprints.update((sprints) => [created, ...sprints])));
  }

  startSprint(sprintId: string): Observable<AgileSprint> {
    return this.request<AgileSprint>(this.api.post(App_API_Endpoints.agile.startSprint(sprintId), {}));
  }

  completeSprint(sprintId: string, targetSprintId?: string): Observable<AgileSprint> {
    return this.request<AgileSprint>(
      this.api.post(App_API_Endpoints.agile.completeSprint(sprintId), { targetSprintId })
    );
  }

  loadIssues(projectId: string): Observable<AgileIssue[]> {
    return this.request<AgileIssue[]>(this.api.get(App_API_Endpoints.agile.projectIssues(projectId))).pipe(
      tap((issues) => this.issues.set(issues))
    );
  }

  createIssue(projectId: string, issue: CreateIssueRequest): Observable<AgileIssue> {
    return this.request<AgileIssue>(
      this.api.post(App_API_Endpoints.agile.projectIssues(projectId), issue)
    ).pipe(tap((created) => this.issues.update((issues) => [created, ...issues])));
  }

  updateIssueStatus(issueId: string, status: IssueStatus): Observable<AgileIssue> {
    return this.request<AgileIssue>(
      this.api.patch<APIResponse, { status: IssueStatus }>(App_API_Endpoints.agile.issueStatus(issueId), { status })
    ).pipe(tap((updated) => this.replaceIssue(updated)));
  }

  updateIssueSprint(issueId: string, sprintRef: string | null): Observable<AgileIssue> {
    return this.request<AgileIssue>(
      this.api.patch<APIResponse, { sprintRef: string | null }>(
        App_API_Endpoints.agile.issueSprint(issueId),
        { sprintRef }
      )
    ).pipe(tap((updated) => this.replaceIssue(updated)));
  }

  updateIssueAssignee(issueId: string, assigneeRef: string | null): Observable<AgileIssue> {
    return this.request<AgileIssue>(
      this.api.patch<APIResponse, { assigneeRef: string | null }>(
        App_API_Endpoints.agile.issueAssignee(issueId),
        { assigneeRef }
      )
    ).pipe(tap((updated) => this.replaceIssue(updated)));
  }

  loadAnalytics(projectId: string): Observable<AgileAnalytics> {
    return this.request<AgileAnalytics>(
      this.api.get(App_API_Endpoints.agile.projectAnalytics(projectId))
    ).pipe(tap((analytics) => this.analytics.set(analytics)));
  }

  clearProjectState(): void {
    this.selectedProject.set(null);
    this.sprints.set([]);
    this.issues.set([]);
    this.analytics.set(null);
  }

  private replaceIssue(updated: AgileIssue): void {
    this.issues.update((issues) => issues.map((issue) => issue._id === updated._id ? updated : issue));
  }

  private request<T>(request: Observable<APIResponse>): Observable<T> {
    this.error.set('');
    return request.pipe(
      map((response) => response.data as T),
      catchError((error: { error?: { message?: string } }) => {
        this.error.set(error.error?.message || 'The agile request could not be completed.');
        return throwError(() => error);
      })
    );
  }
}