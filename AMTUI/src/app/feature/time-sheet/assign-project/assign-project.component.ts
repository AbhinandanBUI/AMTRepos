import { Component, OnInit, signal } from '@angular/core';
import { APIResponse, ProjectAssignment } from '../../../core/app-type-defination';
import { app_projects_data } from '../../../core/app-dummy-data';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MasterAPIService } from '../../../services/master-api.service';
import { App_API_Endpoints } from '../../../core/app-api-endpoints';
import { AssignProjectList, saveAssignProject } from '../time-sheet-model';


@Component({
  standalone: false,
  selector: 'app-assign-project',
  styleUrl: './assign-project.component.css',
  templateUrl: './assign-project.component.html',
})
export class AssignProjectComponent implements OnInit {

  projects: ProjectAssignment[] = app_projects_data;
   assignments = signal<ProjectAssignment[]>([]);
  saved = false;
  assignProjectForm: FormGroup = [] as unknown as FormGroup;


  constructor(private _fb: FormBuilder, private _api: MasterAPIService) { }

  ngOnInit(): void {
    this.initAssignProject();
    this.getProjectList();
  }
  initAssignProject(): void {
    this.assignProjectForm = this._fb.group({
      ProjectName: 0,
      Allocation: 0,
      StartDate: '2026-09-01',
      EndDate: '2026-09-30',
      Notes: '',
    });
  }
  get allocatedHours(): number {
    return this.assignments().reduce((total, assignment) => total + assignment.Allocation, 0);
  }

  onStartDateChange(event: { dateStr: string }): void {
     this.assignProjectForm.setValue({ StartDate: event.dateStr });
    if (this.assignProjectForm.value.EndDate && this.assignProjectForm.value.EndDate < this.assignProjectForm.value.StartDate) {
      this.assignProjectForm.setValue({ EndDate: '' });
    }
  }

  onEndDateChange(event: { dateStr: string }): void {
    if (!this.assignProjectForm.value.StartDate || event.dateStr >= this.assignProjectForm.value.StartDate) {
      this.assignProjectForm.setValue({ EndDate: event.dateStr });
    }
  }

  saveAssignment(): void {

    console.log('assignment form value', this.assignProjectForm.value);

    const formValues = this.assignProjectForm.value;

    if (!formValues.ProjectName || !formValues.StartDate || !formValues.EndDate || formValues.EndDate < formValues.StartDate) {
      return;
    }
 
    const requestBody: saveAssignProject = {
      allocationHours: formValues.Allocation,
      endDate: formValues.EndDate,
      notes: formValues.Notes,
      projectId: formValues.ProjectName,
      startDate: formValues.StartDate,
    }
    this._api.post(App_API_Endpoints.assignProject.save, requestBody).subscribe({
      next: (res: APIResponse) => {
        if (res.statusCode === 200 && res.success) {
          this.getProjectList()
          this.assignProjectForm.reset();
          this.createAssignment()
        }
      },
      error: (err) => {
        console.log('err', err);

      }
    })
    this.saved = true;
    window.setTimeout(() => this.saved = false, 2500);
  }

  getProjectList() {
    this._api.get(App_API_Endpoints.assignProject.get).subscribe({
      next: (res: APIResponse) => {
        if (res.statusCode === 200 && res.success && res.totalrecords > 0) {
          let assproject = res.data.map((task: AssignProjectList, i: number) => ({
            _id: task._id,
            Id: task.assignProjectId,
            ProjectName: this.projects.find(x => x.Id === task.projectId)?.ProjectName,
            Allocation: task.allocationHours,
            StartDate: task.startDate,
            EndDate: task.endDate,
            Notes: task.notes,
          })) as ProjectAssignment[];
          this.assignments.set(assproject);
        }
      },
      error: (err: any) => {
        console.log('err', err);

      }
    })
  }

  removeAssignment(index: number): void {
    // this.assignments.update(this.assignments().filter((_, assignmentIndex) => assignmentIndex !== index));

    let assignProjectId = this.assignments()[index]._id;
    let param = { id: assignProjectId };
    this._api.delete(App_API_Endpoints.assignProject.delete, { params: param }).subscribe({
      next: (res: APIResponse) => {
        if (res.statusCode === 200 && res.success) {
          console.log('d', res);
          this.getProjectList()
        }
      },
      error: (err: any) => {
        console.log('err', err);
      }
    });
  }

  private createAssignment() {
    this.assignProjectForm.setValue({
      ProjectName: 0,
      Allocation: 0,
      StartDate: '2026-09-01',
      EndDate: '2026-09-30',
      Notes: '',
    })
  }
}
