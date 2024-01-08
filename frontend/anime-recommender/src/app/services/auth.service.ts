import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api/';
  private isAuthenticated = false;

  constructor(private http: HttpClient) { }

  login(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}login/`, userData, {
      withCredentials: true
    }).pipe(
      tap((response: any) => {
        if (response.detail === 'Login Successful') {
          this.setAuthenticated(true);
        }
      })
    );
  }  

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}logout/`, {}, {
      withCredentials: true
    }).pipe(
      tap(() => this.setAuthenticated(false))
    );
  }  

  setAuthenticated(value: boolean): void {
    this.isAuthenticated = value;
  }

  loginAuthenticator(): boolean {
    return this.isAuthenticated;
  }

  isLoggedIn(): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}verify-session/`, { withCredentials: true });
  }

  signUp(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}signup/`, userData, {
      withCredentials: true
    });
  }
}
