import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { MovieListComponent } from './movies/components/movie-list/movie-list.component';
import { AuthGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'movies', 
    component: MovieListComponent,
    canActivate: [AuthGuard]
  },
  { path: '', redirectTo: '/movies', pathMatch: 'full' }
];
