import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './helpers/auth.guard';
import { MenuComponent } from './menu/menu.component';

const routes: Routes = [
  { path: '', component: LoginComponent},
  { path: 'menu', component:MenuComponent },

  // otherwise redirect to home
  { path: '**', redirectTo: '' }]


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
