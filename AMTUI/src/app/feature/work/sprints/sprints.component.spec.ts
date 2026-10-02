import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { SprintsComponent } from './sprints.component';
import { AgileService } from '../agile.service';
import { AgileAnalytics, AgileIssue, AgileProject, AgileSprint } from '../agile.models';

describe('SprintsComponent', () => {
  let component: SprintsComponent;
  let fixture: ComponentFixture<SprintsComponent>;

  beforeEach(async () => {
    const agileService = {
      projects: signal<AgileProject[]>([]),
      selectedProject: signal<AgileProject | null>(null),
      sprints: signal<AgileSprint[]>([]),
      issues: signal<AgileIssue[]>([]),
      analytics: signal<AgileAnalytics | null>(null),
      error: signal(''),
      loadAssignableUsers: () => of([]),
      loadProjects: () => of([]),
    } as unknown as AgileService;

    await TestBed.configureTestingModule({
      declarations: [SprintsComponent],
      imports: [CommonModule, FormsModule],
      providers: [{ provide: AgileService, useValue: agileService }],
    })
      .compileComponents();

    fixture = TestBed.createComponent(SprintsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
