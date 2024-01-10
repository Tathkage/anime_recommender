import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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

  // Handles user login
  login(userData: UserLoginData): Observable<any> {
    return this.http.post(`${this.apiUrl}login/`, userData, {
      withCredentials: true
    }).pipe(
      tap(response => this.handleAuthenticationResponse(response)),
      catchError(this.handleError)
    );
  }

  // Handles user logout
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}logout/`, {}, {
      withCredentials: true
    }).pipe(
      tap(() => this.isAuthenticatedSubject.next(false)),
      catchError(this.handleError)
    );
  }

  // Checks if the user is logged in
  isLoggedIn(): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}verify-session/`, { withCredentials: true }).pipe(
      tap(loggedIn => this.isAuthenticatedSubject.next(loggedIn)),
      catchError(this.handleError)
    );
  }

  // Handles user registration
  signUp(userData: UserSignupData): Observable<any> {
    return this.http.post(`${this.apiUrl}signup/`, userData, {
      withCredentials: true
    }).pipe(catchError(this.handleError));
  }

  // Returns the authentication state as an observable
  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  // Handles forgotten password
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}forgot-password/`, { email }, {
      withCredentials: true
    }).pipe(catchError(this.handleError));
  }

  // Private method to handle authentication response
  private handleAuthenticationResponse(response: any) {
    if (response.detail === 'Login Successful') {
      this.isAuthenticatedSubject.next(true);
    }
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred. Please try again later.';

    // Check if it's a server-side error
    if (error.status) {
        // Check for validation error from backend and return it
        if (error.status === 400 && error.error && error.error.error) {
            return throwError(error.error.error);
        }

        // if (error.status === 403 && error.error && error.error.error === 'locked out') {
        //   errorMessage = 'Your account is temporarily locked due to multiple failed login attempts. Please try again later.';
        // }

        console.error(`Backend returned code ${error.status}, body was: ${error.error}`);
        // Customize user-friendly messages for specific status codes
        if (error.status === 0) {
            errorMessage = 'Cannot connect to the server. Please check your network connection.';
        } else if (error.status === 401) {
            return throwError('Not logged in');
        } else if (error.status === 404) {
            errorMessage = 'Requested resource not found.';
        }
        // Add more status codes as needed
    } else {
        // Handle client-side or network error
        console.error('Client-side error:', error.message);
        errorMessage = `A client-side error occurred: ${error.message}`;
    }

    // Return an observable with a user-facing error message
    return throwError(errorMessage);
  }
}
