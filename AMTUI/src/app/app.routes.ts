import { Routes } from '@angular/router';
import { EcommerceComponent } from './pages/dashboard/ecommerce/ecommerce.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { FormElementsComponent } from './pages/forms/form-elements/form-elements.component';
import { BasicTablesComponent } from './pages/tables/basic-tables/basic-tables.component';
import { BlankComponent } from './pages/blank/blank.component';
import { NotFoundComponent } from './pages/other-page/not-found/not-found.component';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';
import { InvoicesComponent } from './pages/invoices/invoices.component';
import { LineChartComponent } from './pages/charts/line-chart/line-chart.component';
import { BarChartComponent } from './pages/charts/bar-chart/bar-chart.component';
import { AlertsComponent } from './pages/ui-elements/alerts/alerts.component';
import { AvatarElementComponent } from './pages/ui-elements/avatar-element/avatar-element.component';
import { BadgesComponent } from './pages/ui-elements/badges/badges.component';
import { ButtonsComponent } from './pages/ui-elements/buttons/buttons.component';
import { ImagesComponent } from './pages/ui-elements/images/images.component';
import { VideosComponent } from './pages/ui-elements/videos/videos.component';
import { SignInComponent } from './pages/auth-pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/auth-pages/sign-up/sign-up.component';
import { CalenderComponent } from './pages/calender/calender.component';

export const routes: Routes = [
  {
    path: 'signin',
    component: SignInComponent,
    title: 'Sign In | Ajile Management Tool'
  },
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      {
        path: '',
        component: EcommerceComponent,
        pathMatch: 'full',
        title:
          'Dashboard | Ajile Management Tool'
      },
      {
        path: 'workitems',
        loadChildren: () => import('./feature/work/work.module').then((m) => m.WorkModule),
        title: 'Work Items | Ajile Management Tool',
      },
      {
        path: 'timesheet',
        loadChildren: () => import('./feature/time-sheet/time-sheet.module').then((m) => m.TimeSheetModule),
        title: 'Timesheet | Ajile Management Tool',
      },
      {
        path: 'settings',
        loadChildren: () => import('./feature/setting/setting.module').then((m) => m.SettingModule),
        title: 'Settings | Ajile Management Tool',
      },
      {
        path: '**',
        component: NotFoundComponent,
        title: 'Not Found | Ajile Management Tool'
      },
      // {
      //   path: '',
      //   component: EcommerceComponent,
      //   pathMatch: 'full',
      //   title:
      //     'Dashboard | Ajile Management Tool',
      // },
      // {
      //   path:'calendar',
      //   component:CalenderComponent,
      //   title:'Calendar | Ajile Management Tool'
      // },
      // {
      //   path:'profile',
      //   component:ProfileComponent,
      //   title:'Profile | Ajile Management Tool'
      // },
      // {
      //   path:'form-elements',
      //   component:FormElementsComponent,
      //   title:'Form Elements | Ajile Management Tool'
      // },
      // {
      //   path:'basic-tables',
      //   component:BasicTablesComponent,
      //   title:'Basic Tables | Ajile Management Tool'
      // },
      // {
      //   path:'blank',
      //   component:BlankComponent,
      //   title:'Blank | Ajile Management Tool'
      // },
      // // support tickets
      // {
      //   path:'invoice',
      //   component:InvoicesComponent,
      //   title:'Invoices | Ajile Management Tool'
      // },
      // {
      //   path:'line-chart',
      //   component:LineChartComponent,
      //   title:'Line Chart | Ajile Management Tool'
      // },
      // {
      //   path:'bar-chart',
      //   component:BarChartComponent,
      //   title:'Bar Chart | Ajile Management Tool'
      // },
      // {
      //   path:'alerts',
      //   component:AlertsComponent,
      //   title:'Alerts | Ajile Management Tool'
      // },
      // {
      //   path:'avatars',
      //   component:AvatarElementComponent,
      //   title:'Avatars | Ajile Management Tool'
      // },
      // {
      //   path:'badge',
      //   component:BadgesComponent,
      //   title:'Badges | Ajile Management Tool'
      // },
      // {
      //   path:'buttons',
      //   component:ButtonsComponent,
      //   title:'Buttons | Ajile Management Tool'
      // },
      // {
      //   path:'images',
      //   component:ImagesComponent,
      //   title:'Images | Ajile Management Tool'
      // },
      // {
      //   path:'videos',
      //   component:VideosComponent,
      //   title:'Videos | Ajile Management Tool'
      // },
    ]
  },
  // auth pages

  {
    path: 'signup',
    component: SignUpComponent,
    title: 'Sign Up | Ajile Management Tool'
  },
  // error pages
  {
    path: '**',
    component: SignInComponent,
    title: 'Not Found | Ajile Management Tool'
  },

];
