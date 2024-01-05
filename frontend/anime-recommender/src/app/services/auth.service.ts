import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api/'; // Ensure using HTTPS in production

  constructor(private http: HttpClient) {}

  login(userData: any) {
    return this.http.post(`${this.apiUrl}login/`, userData).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem('userToken', response.token);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('userToken');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('userToken');
  }

  signUp(userData: any) {
    return this.http.post(`${this.apiUrl}signup/`, userData);
  }
}
