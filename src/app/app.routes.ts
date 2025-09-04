import { Routes } from '@angular/router';
import { ListComponent } from './front/list/list.component';
import { LoginComponent } from './login/login.component';
import { AnswerComponent } from './front/answer/answer.component';
import { CheckComponent } from './front/check/check.component';
import { BackListComponent } from './back/back-list/back-list.component';
import { DialogComponent } from './back/back-list/dialog/dialog.component';
import { MenuComponent } from './menu/menu.component';
import { AddPreviewComponent } from './back/back-list/add-preview/add-preview.component';
import { BackEditComponent } from './back/back-edit/back-edit.component';
import { StatisticalComponent } from './statistical/statistical.component';

export const routes: Routes = [
  { path: 'front/list', component: ListComponent },
  { path: 'front/answer/:elementId', component: AnswerComponent },
  { path: 'login', component: LoginComponent },
  { path: 'front/check', component: CheckComponent },
  { path: 'statistical/:elementId', component: StatisticalComponent },

  { path: 'back/backList', component: BackListComponent,
    children: [
      { path: 'back/backList/dialog', component: DialogComponent },
    ]
  },
  { path: 'back/backEdit/:elementId', component: BackEditComponent },


  { path: 'menu', component: MenuComponent }, // 測試

  { path: 'back/backPreview', component: AddPreviewComponent },
];
