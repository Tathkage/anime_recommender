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
    let userFriendlyMessage = 'An unknown error occurred. Please try again later.';

    // Check if it's a server-side error
    if (error.status) {
        // Check for validation error from backend and return it
        if (error.status === 400 && error.error && error.error.error) {
            return throwError(error.error.error);
        }

        console.error(`Backend returned code ${error.status}, body was: ${error.error}`);
        // Customize user-friendly messages for specific status codes
        if (error.status === 0) {
            userFriendlyMessage = 'Cannot connect to the server. Please check your network connection.';
        } else if (error.status === 401) {
            userFriendlyMessage = 'Unauthorized request. Please login again.';
        } else if (error.status === 404) {
            userFriendlyMessage = 'Requested resource not found.';
        }
        // Add more status codes as needed
    } else {
        // Handle client-side or network error
        console.error('Client-side error:', error.message);
        userFriendlyMessage = `A client-side error occurred: ${error.message}`;
    }

    // Return an observable with a user-facing error message
    return throwError(userFriendlyMessage);
  }
}
