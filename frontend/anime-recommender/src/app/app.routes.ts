import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnimeListComponent } from './anime-list/anime-list.component';
import { UserLoginComponent } from './user-login/user-login.component';
import { UserSignupComponent } from './user-signup/user-signup.component';
import { UserWatchlistComponent } from './user-watchlist/user-watchlist.component';

export const routes: Routes = [
  { path: 'anime-list', component: AnimeListComponent },
  { path: 'user-login', component: UserLoginComponent },
  { path: 'user-signup', component: UserSignupComponent },
  { path: 'user-watchlist', component: UserWatchlistComponent },
  { path: '', redirectTo: '/user-login', pathMatch: 'full' }
];
