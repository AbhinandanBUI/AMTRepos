import { Component } from '@angular/core';
import { ProjectAssignment } from '../../../core/app-type-defination';
import { app_projects_data } from '../../../core/app-dummy-data';


@Component({
  standalone: false,
  selector: 'app-assign-project',
  styleUrl: './assign-project.component.css',
  templateUrl: './assign-project.component.html',
})
export class AssignProjectComponent {
  projects : ProjectAssignment[] = app_projects_data;
  assignment: ProjectAssignment = this.createAssignment();
  assignments: ProjectAssignment[] = [
    {
      Id :3333,
      ProjectName: 'Ajile Management Tool',
      Allocation: 32,
      StartDate: '2026-09-01',
      EndDate: '2026-09-30',
      Notes: 'Core dashboard and work item improvements',
    },
  ];
  saved = false;

  get allocatedHours(): number {
    return this.assignments.reduce((total, assignment) => total + assignment.Allocation, 0);
  }

  onStartDateChange(event: { dateStr: string }): void {
    this.assignment.StartDate = event.dateStr;

    if (this.assignment.EndDate && this.assignment.EndDate < this.assignment.StartDate) {
      this.assignment.EndDate = '';
    }
  }

  onEndDateChange(event: { dateStr: string }): void {
    if (!this.assignment.StartDate || event.dateStr >= this.assignment.StartDate) {
      this.assignment.EndDate = event.dateStr;
    }
  }

  saveAssignment(): void {
    if (!this.assignment.ProjectName || !this.assignment.StartDate || !this.assignment.EndDate || this.assignment.EndDate < this.assignment.StartDate) {
      return;
    }

    this.assignments = [...this.assignments, { ...this.assignment }];
    this.assignment = this.createAssignment();
    this.saved = true;
    window.setTimeout(() => this.saved = false, 2500);
  }

  removeAssignment(index: number): void {
    this.assignments = this.assignments.filter((_, assignmentIndex) => assignmentIndex !== index);
  }

  private createAssignment(): ProjectAssignment {
    return {
      Id: 122,
      ProjectName: '',
      Allocation: 8,
      StartDate: '2026-09-01',
      EndDate: '2026-09-30',
      Notes: '',
    };
  }
}
