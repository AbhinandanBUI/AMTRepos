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
import { UnauthorizedComponent } from '../../pages/other-page/unauthorized/unauthorized.component';
import { roleGuard } from '../../authConfig/role.guard';
import { AGILE_MANAGEMENT_ROLES, AGILE_WORKFLOW_ROLES } from './agile.models';
 
const routes: Routes = [
  { path: '', component: WorkComponent },
  { path: 'backlogs', component: BacklogsComponent },
  { path: 'boards', component: BoardsComponent, canActivate: [roleGuard], data: { roles: AGILE_WORKFLOW_ROLES, modulePath: '/workitems' } },
  { path: 'my-query', component: MyQueryComponent },
  { path: 'sprints', component: SprintsComponent, canActivate: [roleGuard], data: { roles: AGILE_MANAGEMENT_ROLES, modulePath: '/workitems' } },
  { path: 'unauthorized', component: UnauthorizedComponent, title: 'Unauthorized | Work Items' },
  { path: 'work-items', component: WorkItemsComponent, canActivate: [roleGuard], data: { roles: AGILE_WORKFLOW_ROLES, modulePath: '/workitems' } },
  { path: 'work-items/:type', component: WorkItemTypeComponent },
  { path: 'work-item-create', component: WorkItemCreateComponent },
  { path: '**', redirectTo: 'boards' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkRoutingModule { }
