import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User, UpdateUserData } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Retrieves the current user's data
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}get-current-user/`, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }  

  // Updates the current user's data
  updateUser(userData: UpdateUserData): Observable<any> {
    return this.http.put(`${this.apiUrl}update-user/`, userData, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }
  
  // Deletes the current user's account
  deleteUser(): Observable<any> {
    return this.http.delete(`${this.apiUrl}delete-user/`, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  // Error handling for HTTP requests
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage: string;

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      console.error('Client-side error:', error.error.message);
      errorMessage = `A client-side error occurred: ${error.error.message}`;
    } else {
      // Server-side error
      console.error(`Server returned code ${error.status}, body was: ${error.error}`);
      errorMessage = `Server error ${error.status}: ${error.statusText}`;
    }

    // Return an observable with a user-facing error message
    return throwError(errorMessage);
  }
}
