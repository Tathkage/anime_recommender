import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> | boolean {
    return this.authService.isLoggedIn().pipe(
      catchError(() => {
        this.router.navigate(['/user-login']);
        return of(false); // 'of' is used to return an Observable
      }),
      map((response: any) => { // Casting response to 'any' or define a proper type
        if (!response.authenticated) {
          this.router.navigate(['/user-login']);
          return false;
        }
        return true;
      })
    );
  }
}
