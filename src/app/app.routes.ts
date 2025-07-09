import { Routes } from '@angular/router';
import { ListComponent } from './front/list/list.component';
import { LoginComponent } from './login/login.component';
import { AnswerComponent } from './front/answer/answer.component';

export const routes: Routes = [
  { path: 'front/list', component: ListComponent },
  { path: 'front/answer', component: AnswerComponent },
  { path: 'login', component: LoginComponent },
];
