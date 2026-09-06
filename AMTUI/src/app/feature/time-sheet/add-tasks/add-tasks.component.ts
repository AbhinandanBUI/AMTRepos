import { Component, OnInit, signal } from '@angular/core';
import { Id_Name_Type, TimeTask, ProjectAssignment } from '../../../core/app-type-defination';
import { Work_Item_Priority, Work_Item_Status } from '../../../core/app-constant-data';
import { MasterAPIService } from '../../../services/master-api.service';
import { App_API_Endpoints } from '../../../core/app-api-endpoints';
import { app_projects_data } from '../../../core/app-dummy-data';

@Component({
  standalone: false,
  selector: 'app-add-tasks',
  styleUrl: './add-tasks.component.css',
  templateUrl: './add-tasks.component.html',
})
export class AddTasksComponent implements OnInit {
  projects: ProjectAssignment[] = app_projects_data;
  priorities: Id_Name_Type[] = Work_Item_Priority;
  statuses: Id_Name_Type[] = Work_Item_Status;
  task: TimeTask = this.createTask();
  tasks = signal<TimeTask[]>([]);
  saved = false;

  constructor(private _api: MasterAPIService) {


  }
  ngOnInit(): void {
    this.getTasks();
  }




  saveTask(): void {
    if (!this.task.Name.trim() || !this.task.Project || this.task.Estimate < 1) {
      return;
    }
    this.tasks.update(tasks => [...tasks, { ...this.task, Name: this.task.Name.trim() }]);
    this.task = this.tasks().find(x => x.Id === this.task.Id) ?? this.createTask();
    let projectId = this.task.Project.Id;
    const requestBody = {
      taskName: this.task.Name,
      projectId: projectId,
      estimatedHours: this.task.Estimate,
      priority: this.task.Priority.Id,
      status: this.task.Status.Id,
      notes: this.task.Notes
    };
    this._api.post(App_API_Endpoints.taskAPI.saveTask, requestBody).subscribe({
      next: (response) => {
        console.log('Task saved successfully', response);
        this.getTasks();
      },
      error: (error) => {
        console.error('Error saving task', error);
      }
    });
    this.saved = true;
    window.setTimeout(() => this.saved = false, 2500);
  }

  removeTask(index: number): void {
     this.deleteTask(this.tasks()[index]._id)
    // this.tasks.update(tasks => tasks.filter((_, taskIndex) => taskIndex !== index));
   
  }

  getTasks(): void {
    this._api.get(App_API_Endpoints.taskAPI.getTask).subscribe({
      next: (response: any) => {
        let teim = response.data.map((task: any, i: number) => ({
          Id: task.taskId,
          _id: task._id,
          Name: task.taskName,
          Project: this.projects.find(p => p.Id === task.projectId) ?? { Id: 0, Name: '', OrderBy: 0 },
          Estimate: task.estimatedHours,
          Priority: this.priorities.find(p => p.Id === task.priority) ?? { Id: 0, Name: '', OrderBy: 0 },
          Status: this.statuses.find(s => s.Id === task.status) ?? { Id: 0, Name: '', OrderBy: 0 },
          Notes: task.notes,
          CreatedAt:task.createdAt
        })) as TimeTask[];
        this.tasks.set(teim);
      },

      error: (error) => {
        console.error('Error fetching tasks', error);
      }
    });
  }
  deleteTask(taskId: string): void {
    let param = { id: taskId };
    this._api.delete(`${App_API_Endpoints.taskAPI.deleteTask}`, { params: param }).subscribe({
      next: (response) => {
        console.log('Task deleted successfully', response);
        this.getTasks();
      },
      error: (err) => {
        console.log('err', err);

      }
    });
  }
  get totalEstimate(): number {
    return this.tasks().reduce((total, task) => total + task.Estimate, 0);
  }

  get completedTasks(): number {
    return this.tasks().filter((task) => task.Status.Name === this.statuses[2].Name).length;
  }
  private createTask(): TimeTask {
    return {
      _id:'',
      Id: 0,
      Name: '',
      Project: this.projects[0],
      Estimate: 1,
      Priority: this.priorities[0],
      Status: this.statuses[0],
      Notes: '',
      CreatedAt: new Date()
    };
  }
}
