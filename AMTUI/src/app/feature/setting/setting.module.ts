import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingRoutingModule } from './setting-routing.module';
import { SettingComponent } from '../setting/setting.component';
import { PreferencesComponent } from './preferences/preferences.component';
import { ProfileComponent } from './profile/profile.component';
import { AccountComponent } from './account/account.component';


@NgModule({
  declarations: [
    SettingComponent,
    PreferencesComponent,
    ProfileComponent,
    AccountComponent
  ],
  imports: [
    CommonModule,
    SettingRoutingModule
  ]
})
export class SettingModule { }
