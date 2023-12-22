import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  constructor(private http: HttpClient) {}

  login(userData: any) {
    return this.http.post('http://localhost:8000/api/login/', userData); // Adjust endpoint
  }

  signUp(userData: any) {
    return this.http.post('http://localhost:8000/api/signup/', userData); // Adjust endpoint
  }
}
