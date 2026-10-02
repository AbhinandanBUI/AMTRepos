import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { WorkItemsComponent } from './work-items.component';
import { AgileService } from '../agile.service';
import { AgileIssue, AgileProject, AgileSprint, AgileUser } from '../agile.models';

describe('WorkItemsComponent', () => {
  let component: WorkItemsComponent;
  let fixture: ComponentFixture<WorkItemsComponent>;
  let agileService: jasmine.SpyObj<AgileService>;
  const member: AgileUser = {
    _id: 'member-1',
    fullName: 'Riley Member',
    username: 'riley',
    email: 'riley@example.test',
    role: 'Developer',
  };
  const project: AgileProject = {
    _id: 'project-1',
    name: 'Project One',
    key: 'PRJ',
    description: '',
    lead: member,
    members: [member],
    createdBy: member._id,
  };
  const sprint: AgileSprint = {
    _id: 'sprint-1',
    projectId: project._id,
    name: 'Sprint 1',
    sprintGoal: '',
    startDate: '2026-10-01',
    endDate: '2026-10-14',
    status: 'Active',
  };

  beforeEach(async () => {
    agileService = jasmine.createSpyObj<AgileService>('AgileService', [
      'loadProjects',
      'loadIssues',
      'loadSprints',
      'createIssue',
      'updateIssueStatus',
      'updateIssueAssignee',
      'updateIssueSprint',
      'clearProjectState',
    ], {
      projects: signal<AgileProject[]>([project]),
      selectedProject: signal<AgileProject | null>(project),
      issues: signal<AgileIssue[]>([]),
      sprints: signal<AgileSprint[]>([sprint]),
      error: signal(''),
    });
    agileService.loadProjects.and.returnValue(of([project]));
    agileService.loadIssues.and.returnValue(of([]));
    agileService.loadSprints.and.returnValue(of([sprint]));
    agileService.createIssue.and.returnValue(of({
      _id: 'issue-1',
      issueKey: 'PRJ-1',
      projectRef: project._id,
      sprintRef: sprint,
      title: 'Persisted story',
      description: 'Story details',
      status: 'To Do',
      priority: 'High',
      storyPoints: 5,
      assigneeRef: member,
    }));

    await TestBed.configureTestingModule({
      declarations: [WorkItemsComponent],
      imports: [CommonModule, FormsModule],
      providers: [{ provide: AgileService, useValue: agileService }],
    })
      .compileComponents();

    fixture = TestBed.createComponent(WorkItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('creates a persisted issue with its project, sprint, and member assignment', () => {
    component.newTitle = 'Persisted story';
    component.newDescription = 'Story details';
    component.newPriority = 'High';
    component.newStoryPoints = 5;
    component.newAssigneeId = member._id;
    component.newSprintId = sprint._id;

    component.createIssue();

    expect(agileService.createIssue).toHaveBeenCalledWith(project._id, {
      title: 'Persisted story',
      description: 'Story details',
      status: 'To Do',
      priority: 'High',
      storyPoints: 5,
      assigneeRef: member._id,
      sprintRef: sprint._id,
    });
    expect(component.isCreating).toBeFalse();
  });
});
