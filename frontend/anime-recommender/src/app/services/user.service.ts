// user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User, UpdateUserData } from '../models/user.model'; // Assuming these interfaces are defined

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}get-current-user/`, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }  

  updateUser(userData: UpdateUserData): Observable<any> {
    return this.http.put(`${this.apiUrl}update-user/`, userData, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }
  
  deleteUser(): Observable<any> {
    return this.http.delete(`${this.apiUrl}delete-user/`, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error has occurred';
    // Customize error messages here based on error.status or error.error
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error ${error.status}: ${error.statusText}`;
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }
}
