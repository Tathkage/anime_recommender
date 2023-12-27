import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WatchlistService {
  private apiUrl = 'http://localhost:8000/api/';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('userToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    });
  }

  createWatchlist(title: string): Observable<any> {
    return this.http.post(`${this.apiUrl}create_watchlist/`, { title }, { headers: this.getHeaders() });
  }

  getWatchlists(): Observable<any> {
    return this.http.get(`${this.apiUrl}get_watchlists/`, { headers: this.getHeaders() });
  }

  updateWatchlist(watchlistId: number, newTitle: string): Observable<any> {
    return this.http.post(`${this.apiUrl}update_watchlist/${watchlistId}/`, { title: newTitle }, { headers: this.getHeaders() });
  }

  deleteWatchlist(watchlistId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}delete_watchlist/${watchlistId}/`, { headers: this.getHeaders() });
  }

  addAnimeToWatchlist(watchlistId: number, animeId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}add-anime-to-watchlist/`, { watchlistId, animeId }, { headers: this.getHeaders() });
  }
}
