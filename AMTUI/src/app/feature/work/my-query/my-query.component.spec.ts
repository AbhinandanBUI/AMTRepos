import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { MyQueryComponent } from './my-query.component';
import { AgileService } from '../agile.service';
import { AgileIssue, AgileProject } from '../agile.models';
import { AuthService } from '../../../services/StorageServices/auth-service.service';

describe('MyQueryComponent', () => {
  let component: MyQueryComponent;
  let fixture: ComponentFixture<MyQueryComponent>;
  const currentUser = { id: 'member-1', email: 'member@example.test', name: 'Current Member', profileUrl: '' };
  const project: AgileProject = {
    _id: 'project-1', name: 'Project One', key: 'PRJ', description: '',
    lead: 'member-1', createdBy: 'member-1', members: ['member-1'],
  };
  const issues: AgileIssue[] = [
    {
      _id: 'issue-1', issueKey: 'PRJ-1', projectRef: project._id, sprintRef: null,
      title: 'Member login story', description: '', status: 'Backlog', priority: 'High', storyPoints: 3,
      assigneeRef: { _id: 'member-1', fullName: 'Current Member', username: 'member', email: currentUser.email, role: 'Developer' },
    },
    {
      _id: 'issue-2', issueKey: 'PRJ-2', projectRef: project._id, sprintRef: null,
      title: 'Other profile story', description: '', status: 'In Progress', priority: 'Low', storyPoints: 2,
      assigneeRef: { _id: 'member-2', fullName: 'Other Member', username: 'other', email: 'other@example.test', role: 'Developer' },
    },
  ];

  beforeEach(async () => {
    const agileService = {
      error: signal(''),
      loadProjects: () => of([project]),
      fetchProjectIssues: () => of(issues),
    } as unknown as AgileService;
    const authService = { user: signal(currentUser) } as unknown as AuthService;

    await TestBed.configureTestingModule({
      declarations: [MyQueryComponent],
      imports: [CommonModule, FormsModule],
      providers: [
        { provide: AgileService, useValue: agileService },
        { provide: AuthService, useValue: authService },
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(MyQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads persisted project issues and defaults to the signed-in member', () => {
    expect(component.issues.length).toBe(2);
    expect(component.filteredIssues.map((issue) => issue.issueKey)).toEqual(['PRJ-1']);

    component.assignedToMeOnly = false;
    expect(component.filteredIssues.length).toBe(2);
  });

  it('filters persisted issues using query tokens', () => {
    component.assignedToMeOnly = false;
    component.queryText = 'project:PRJ status:"In Progress" priority:Low';

    expect(component.filteredIssues.map((issue) => issue.issueKey)).toEqual(['PRJ-2']);
  });
});
