import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8000/api/'; // Ensure using HTTPS in production

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error has occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // The backend returned an unsuccessful response code
      if (error.status === 0) {
        errorMessage = 'Cannot connect to API';
      } else {
        errorMessage = `Error ${error.status}: ${error.statusText}`;
      }
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }

  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}get-current-user/`, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }  

  updateUser(userData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}update-user/`, userData, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }
  
  deleteUser(): Observable<any> {
    return this.http.delete(`${this.apiUrl}delete-user/`, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }
}
