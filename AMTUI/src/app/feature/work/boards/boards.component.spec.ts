import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { BoardsComponent } from './boards.component';
import { AgileService } from '../agile.service';
import { AgileAnalytics, AgileIssue, AgileProject, AgileSprint } from '../agile.models';
import { StoryCardComponent } from '../../../shared/components/agile/story-card/story-card.component';

describe('BoardsComponent', () => {
  let component: BoardsComponent;
  let fixture: ComponentFixture<BoardsComponent>;

  beforeEach(async () => {
    const agileService = {
      projects: signal<AgileProject[]>([]),
      selectedProject: signal<AgileProject | null>(null),
      sprints: signal<AgileSprint[]>([]),
      issues: signal<AgileIssue[]>([]),
      analytics: signal<AgileAnalytics | null>(null),
      error: signal(''),
      loadProjects: () => of([]),
    } as unknown as AgileService;

    await TestBed.configureTestingModule({
      declarations: [BoardsComponent],
      imports: [CommonModule, FormsModule, DragDropModule, StoryCardComponent],
      providers: [{ provide: AgileService, useValue: agileService }],
    })
      .compileComponents();

    fixture = TestBed.createComponent(BoardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows a sprint issue in its assignee bucket', () => {
    const project: AgileProject = {
      _id: 'project-1',
      name: 'Project',
      key: 'PRJ',
      description: '',
      lead: 'user-1',
      members: [{ _id: 'user-1', fullName: 'Riley Member', username: 'riley', email: 'riley@example.test', role: 'Developer' }],
      createdBy: 'user-1',
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
    const issue: AgileIssue = {
      _id: 'issue-1',
      issueKey: 'PRJ-1',
      projectRef: project._id,
      sprintRef: sprint,
      title: 'Assigned story',
      description: '',
      status: 'In Progress',
      priority: 'Medium',
      storyPoints: 3,
      assigneeRef: {
        _id: 'user-1',
        fullName: 'Riley Member',
        username: 'riley',
        email: 'riley@example.test',
        role: 'Developer',
      },
    };

    component.selectedProject.set(project);
    component.sprints.set([sprint]);
    component.issues.set([issue]);
    component.selectedSprintId = sprint._id;

    const progressLane = component.cardsByLane.find((lane) => lane.status === 'In Progress');
    expect(progressLane?.buckets.find((bucket) => bucket.id === 'user-1')?.issues).toEqual([issue]);
  });
});
