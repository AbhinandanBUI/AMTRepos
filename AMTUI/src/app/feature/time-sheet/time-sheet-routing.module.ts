import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TimeSheetComponent } from './time-sheet.component';
import { OverViewComponent } from './over-view/over-view.component';
import { FillTimeSheetComponent } from './fill-time-sheet/fill-time-sheet.component';
import { AssignProjectComponent } from './assign-project/assign-project.component';
import { AddTasksComponent } from './add-tasks/add-tasks.component';

const routes: Routes = [
  {
    path: '',
    component: TimeSheetComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'overview',
      },
      {
        path: 'overview',
        component: OverViewComponent,
        title: 'Timesheet Overview | Ajile Management Tool',
      },
      {
        path: 'fill',
        component: FillTimeSheetComponent,
        title: 'Fill Timesheet | Ajile Management Tool',
      },
      {
        path: 'assign-project',
        component: AssignProjectComponent,
        title: 'Assign Project | Ajile Management Tool',
      },
      {
        path: 'add-tasks',
        component: AddTasksComponent,
        title: 'Add Tasks | Ajile Management Tool',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TimeSheetRoutingModule { }
