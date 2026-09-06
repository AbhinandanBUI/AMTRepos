import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePickerComponent } from '../../shared/components/form/date-picker/date-picker.component';

import { TimeSheetRoutingModule } from './time-sheet-routing.module';
import { TimeSheetComponent } from './time-sheet.component';
import { AddTasksComponent } from './add-tasks/add-tasks.component';
import { AssignProjectComponent } from './assign-project/assign-project.component';
import { FillTimeSheetComponent } from './fill-time-sheet/fill-time-sheet.component';
import { OverViewComponent } from './over-view/over-view.component';


@NgModule({
  declarations: [TimeSheetComponent, OverViewComponent, FillTimeSheetComponent, AssignProjectComponent, AddTasksComponent],
  imports: [
    CommonModule,
    FormsModule,
    DatePickerComponent,
    TimeSheetRoutingModule
  ]
})
export class TimeSheetModule { }
