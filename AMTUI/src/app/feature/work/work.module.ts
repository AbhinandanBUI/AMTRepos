import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePickerComponent } from '../../shared/components/form/date-picker/date-picker.component';

import { WorkRoutingModule } from './work-routing.module';
import { WorkComponent } from './work.component';
import { WorkItemsComponent } from './work-items/work-items.component';
import { SprintsComponent } from './sprints/sprints.component';
import { MyQueryComponent } from './my-query/my-query.component';
import { BoardsComponent } from './boards/boards.component';
import { BacklogsComponent } from './backlogs/backlogs.component';
import { WorkItemCreateComponent } from './work-item-create/work-item-create.component';
import { WorkItemTypeComponent } from './work-item-type/work-item-type.component';


@NgModule({
  declarations: [WorkComponent,BacklogsComponent, BoardsComponent, MyQueryComponent, SprintsComponent, WorkItemsComponent, WorkItemCreateComponent, WorkItemTypeComponent],
  imports: [
    CommonModule,
    FormsModule,
    DatePickerComponent,
    WorkRoutingModule
  ]
})
export class WorkModule { }
