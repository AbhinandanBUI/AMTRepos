import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from '../admin/admin.component';
import { CreateDevelopmentStateComponent } from './create-development-state/create-development-state.component';
import { CreateWorkItemComponent } from './create-work-item/create-work-item.component';


@NgModule({
  declarations: [
    AdminComponent,
    CreateDevelopmentStateComponent,
    CreateWorkItemComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
