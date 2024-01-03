import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnimeListComponent } from './anime-list/anime-list.component';
import { UserLoginComponent } from './user-login/user-login.component';
import { UserSignupComponent } from './user-signup/user-signup.component';
import { UserWatchlistComponent } from './user-watchlist/user-watchlist.component';
import { UserSettingsComponent } from './user-settings/user-settings.componet';
import {AuthGuard} from './auth.guard'

export const routes: Routes = [
  { path: 'anime-list', component: AnimeListComponent, canActivate: [AuthGuard] },
  { path: 'user-login', component: UserLoginComponent },
  { path: 'user-signup', component: UserSignupComponent },
  { path: 'user-watchlist', component: UserWatchlistComponent, canActivate: [AuthGuard] },
  { path: 'user-settings', component: UserSettingsComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/user-login', pathMatch: 'full' }
];
