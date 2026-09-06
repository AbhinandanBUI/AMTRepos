import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkComponent } from './work.component';
import { BoardsComponent } from './boards/boards.component';
import { MyQueryComponent } from './my-query/my-query.component';
import { SprintsComponent } from './sprints/sprints.component';
import { WorkItemsComponent } from './work-items/work-items.component';
import { WorkItemTypeComponent } from './work-item-type/work-item-type.component';
import { BacklogsComponent } from './backlogs/backlogs.component';
import { WorkItemCreateComponent } from './work-item-create/work-item-create.component';
 
const routes: Routes = [
  { path: '', component: WorkComponent },
  { path: 'backlogs', component: BacklogsComponent },
  { path: 'boards', component: BoardsComponent },
  { path: 'my-query', component: MyQueryComponent },
  { path: 'sprints', component: SprintsComponent },
  { path: 'work-items', component: WorkItemsComponent },
  { path: 'work-items/:type', component: WorkItemTypeComponent },
  { path: 'work-item-create', component: WorkItemCreateComponent },
  { path: '**', redirectTo: 'boards' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkRoutingModule { }
