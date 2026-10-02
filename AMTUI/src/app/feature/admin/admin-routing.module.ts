import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { CreateWorkItemComponent } from './create-work-item/create-work-item.component';
import { CreateDevelopmentStateComponent } from './create-development-state/create-development-state.component';
import { roleGuard } from '../../authConfig/role.guard';
import { TEST_USER_ADMIN_ROLES } from '../work/agile.models';


const routes: Routes = [
  { path: '', component: AdminComponent },
  { path: 'workItems', component: CreateWorkItemComponent },
  { path: 'development-state', component: CreateDevelopmentStateComponent },
  {
    path: 'test-users',
    loadComponent: () => import('./test-users/test-users.component').then((module) => module.TestUsersComponent),
    canActivate: [roleGuard],
    data: { roles: TEST_USER_ADMIN_ROLES, modulePath: '/admin' },
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('../../pages/other-page/unauthorized/unauthorized.component').then((module) => module.UnauthorizedComponent),
    title: 'Unauthorized | Admin',
  },
  { path: '**', redirectTo: 'workItems' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
