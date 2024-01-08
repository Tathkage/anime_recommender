// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { UserLoginData, UserSignupData } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) { }

  login(userData: UserLoginData): Observable<any> {
    return this.http.post(`${this.apiUrl}login/`, userData, {
      withCredentials: true
    }).pipe(
      tap((response: any) => {
        if (response.detail === 'Login Successful') {
          this.isAuthenticatedSubject.next(true);
        }
      }),
      catchError(this.handleError)
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}logout/`, {}, {
      withCredentials: true
    }).pipe(
      tap(() => this.isAuthenticatedSubject.next(false)),
      catchError(this.handleError)
    );
  }

  isLoggedIn(): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}verify-session/`, { withCredentials: true }).pipe(
      tap((loggedIn: boolean) => this.isAuthenticatedSubject.next(loggedIn)),
      catchError(this.handleError)
    );
  }

  signUp(userData: UserSignupData): Observable<any> {
    return this.http.post(`${this.apiUrl}signup/`, userData, {
      withCredentials: true
    }).pipe(catchError(this.handleError));
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  private handleError(error: any) {
    // Handle the error here
    // Optionally, re-throw the error after handling
    return throwError(error);
  }
}
