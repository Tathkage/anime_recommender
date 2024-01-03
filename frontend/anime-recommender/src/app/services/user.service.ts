import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8000/api/';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('userToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    });
  }

  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}get-current-user/`, { headers: this.getHeaders() });
  }

  updateUser(userData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}update-user/`, userData, { headers: this.getHeaders() });
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}delete-user/${userId}/`, { headers: this.getHeaders() });
  }
}
