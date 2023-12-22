import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  constructor(private http: HttpClient) {}

  login(userData: any) {
    return this.http.post('http://localhost:8000/api/login/', userData).pipe(
      tap((response: any) => localStorage.setItem('userToken', response.taken))
    );
  }

  logout() {
    localStorage.removeItem('userToken');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('userToken')
  }

  signUp(userData: any) {
    return this.http.post('http://localhost:8000/api/signup/', userData);
  }
}
