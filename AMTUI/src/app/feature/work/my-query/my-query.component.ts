import { Component, inject, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AuthService } from '../../../services/StorageServices/auth-service.service';
import { AgileService } from '../agile.service';
import { AgileIssue, AgileProject, ISSUE_PRIORITIES, ISSUE_STATUSES } from '../agile.models';

interface QueryIssue extends AgileIssue {
  projectKey: string;
  projectName: string;
}

type QueryTokens = Partial<Record<'key' | 'project' | 'assignee' | 'status' | 'priority' | 'title', string>>;

@Component({
  standalone: false,
  selector: 'app-my-query',
  styleUrl: './my-query.component.css',
  templateUrl: './my-query.component.html',
})
export class MyQueryComponent implements OnInit {
  private readonly agile = inject(AgileService);
  private readonly auth = inject(AuthService);
  queryText = '';
  titleQ = '';
  projectQ = '';
  assigneeQ = '';
  statusQ = '';
  priorityQ = '';
  assignedToMeOnly = true;
  projects: AgileProject[] = [];
  issues: QueryIssue[] = [];
  readonly statuses = ISSUE_STATUSES;
  readonly priorities = ISSUE_PRIORITIES;
  isLoading = false;
  pageSize = 8;
  currentPage = 1;

  ngOnInit(): void {
    this.loadIssues();
  }

  get assignees(): string[] {
    const assignees = this.issues.map((issue) => issue.assigneeRef?.fullName || 'Unassigned');
    return [...new Set(assignees)].sort((left, right) => left.localeCompare(right));
  }

  get filteredIssues(): QueryIssue[] {
    const parsed = this.parseQuery(this.queryText.trim());
    const freeText = parsed.freeText.toLowerCase();
    return this.issues.filter((issue) => {
      const assignee = issue.assigneeRef?.fullName || 'Unassigned';
      const searchableText = `${issue.issueKey} ${issue.title} ${issue.projectKey} ${issue.projectName} ${assignee}`.toLowerCase();
      const matchesOwner = !this.assignedToMeOnly || issue.assigneeRef?._id === this.auth.user()?.id;
      const assigneeToken = parsed.tokens.assignee;
      const matchesAssignee = !assigneeToken || (assigneeToken.toLowerCase() === 'me'
        ? issue.assigneeRef?._id === this.auth.user()?.id
        : this.matches(assignee, assigneeToken, true));
      return matchesOwner &&
        this.matches(issue.issueKey, parsed.tokens.key, true) &&
        this.matches(`${issue.projectKey} ${issue.projectName}`, parsed.tokens.project, true) &&
        matchesAssignee &&
        this.matches(issue.status, parsed.tokens.status, false) &&
        this.matches(issue.priority, parsed.tokens.priority, false) &&
        this.matches(issue.title, parsed.tokens.title, true) &&
        (!this.projectQ || issue.projectKey === this.projectQ) &&
        (!this.assigneeQ || assignee === this.assigneeQ) &&
        (!this.statusQ || issue.status === this.statusQ) &&
        (!this.priorityQ || issue.priority === this.priorityQ) &&
        (!this.titleQ || issue.title.toLowerCase().includes(this.titleQ.trim().toLowerCase())) &&
        (!freeText || searchableText.includes(freeText));
    });
  }

  get totalResults(): number { return this.filteredIssues.length; }
  get totalPages(): number { return Math.max(1, Math.ceil(this.totalResults / this.pageSize)); }
  get pages(): number[] { return Array.from({ length: this.totalPages }, (_, index) => index + 1); }
  get pagedIssues(): QueryIssue[] {
    const safePage = Math.min(this.currentPage, this.totalPages);
    const start = (safePage - 1) * this.pageSize;
    return this.filteredIssues.slice(start, start + this.pageSize);
  }

  parseQuery(query: string): { tokens: QueryTokens; freeText: string } {
    const tokens: QueryTokens = {};
    const tokenPattern = /\b(key|project|assignee|status|state|priority|title):("([^"]+)"|([^\s]+))/gi;
    let match: RegExpExecArray | null;
    while ((match = tokenPattern.exec(query)) !== null) {
      const rawKey = match[1].toLowerCase();
      const key = rawKey === 'state' ? 'status' : rawKey as keyof QueryTokens;
      tokens[key] = match[3] || match[4];
    }
    return { tokens, freeText: query.replace(tokenPattern, '').trim() };
  }

  setPage(page: number): void {
    const n = Number(page);
    if (!Number.isFinite(n)) return;
    if (n < 1) this.currentPage = 1;
    else if (n > this.totalPages) this.currentPage = this.totalPages;
    else this.currentPage = n;
  }
  prevPage(): void { this.setPage(this.currentPage - 1); }
  nextPage(): void { this.setPage(this.currentPage + 1); }
  setPageSize(size: number | string): void {
    const parsedSize = Number(size);
    if (!Number.isFinite(parsedSize) || parsedSize < 1) return;
    this.pageSize = parsedSize;
    this.currentPage = 1;
  }

  clear(): void {
    this.queryText = '';
    this.titleQ = '';
    this.projectQ = '';
    this.assigneeQ = '';
    this.statusQ = '';
    this.priorityQ = '';
    this.currentPage = 1;
  }

  getAssigneeName(issue: QueryIssue): string {
    return issue.assigneeRef?.fullName || 'Unassigned';
  }

  getInitials(name: string): string {
    return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  }

  private loadIssues(): void {
    this.isLoading = true;
    this.agile.loadProjects().pipe(
      switchMap((projects) => {
        this.projects = projects;
        if (!projects.length) return of([] as QueryIssue[]);
        return forkJoin(projects.map((project) => this.agile.fetchProjectIssues(project._id).pipe(
          map((issues) => issues.map((issue) => ({
            ...issue,
            projectKey: project.key,
            projectName: project.name,
          })))
        ))).pipe(map((issueGroups) => issueGroups.flat()));
      }),
      catchError(() => {
        return of([] as QueryIssue[]);
      })
    ).subscribe((issues) => {
      this.issues = issues;
      this.isLoading = false;
      this.currentPage = 1;
    });
  }

  private matches(actual: string, expected: string | undefined, includes: boolean): boolean {
    if (!expected) return true;
    const value = actual.toLowerCase();
    const query = expected.toLowerCase();
    return includes ? value.includes(query) : value === query;
  }
}
