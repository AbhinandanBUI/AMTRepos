import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { BacklogsComponent } from './backlogs.component';
import { AgileService } from '../agile.service';
import { AgileIssue, AgileProject, AgileSprint } from '../agile.models';
import { AuthService } from '../../../services/StorageServices/auth-service.service';

describe('BacklogsComponent', () => {
  let component: BacklogsComponent;
  let fixture: ComponentFixture<BacklogsComponent>;
  let agileService: {
    projects: ReturnType<typeof signal<AgileProject[]>>;
    selectedProject: ReturnType<typeof signal<AgileProject | null>>;
    sprints: ReturnType<typeof signal<AgileSprint[]>>;
    issues: ReturnType<typeof signal<AgileIssue[]>>;
    error: ReturnType<typeof signal<string>>;
  };

  beforeEach(async () => {
    agileService = {
      projects: signal<AgileProject[]>([]),
      selectedProject: signal<AgileProject | null>(null),
      sprints: signal<AgileSprint[]>([]),
      issues: signal<AgileIssue[]>([]),
      error: signal(''),
    };
    const agileMock = {
      ...agileService,
      loadProjects: () => of([]),
      loadIssues: () => of([]),
      loadSprints: () => of([]),
      updateIssueSprint: () => of({}),
    };
    const authMock = { user: signal({ id: 'member-1', email: '', name: '', profileUrl: '' }) };

    await TestBed.configureTestingModule({
      declarations: [BacklogsComponent],
      imports: [CommonModule, FormsModule],
      providers: [
        { provide: AgileService, useValue: agileMock },
        { provide: AuthService, useValue: authMock },
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(BacklogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("shows only the signed-in member's assigned backlog stories by default", () => {
    agileService.issues.set([
      {
        _id: 'issue-1', issueKey: 'PRJ-1', projectRef: 'project-1', sprintRef: null,
        title: 'My story', description: '', status: 'Backlog', priority: 'High', storyPoints: 3,
        assigneeRef: { _id: 'member-1', fullName: 'Current Member', username: 'member', email: '', role: 'Developer' },
      },
      {
        _id: 'issue-2', issueKey: 'PRJ-2', projectRef: 'project-1', sprintRef: null,
        title: 'Another member story', description: '', status: 'Backlog', priority: 'Low', storyPoints: 2,
        assigneeRef: { _id: 'member-2', fullName: 'Another Member', username: 'other', email: '', role: 'Developer' },
      },
    ]);

    expect(component.backlogIssues().map((issue) => issue.issueKey)).toEqual(['PRJ-1']);
    component.assignedToMeOnly.set(false);
    expect(component.backlogIssues().length).toBe(2);
  });
});
