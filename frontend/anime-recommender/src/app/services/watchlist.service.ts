import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WatchlistService {
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

  createWatchlist(title: string): Observable<any> {
    return this.http.post(`${this.apiUrl}create_watchlist/`, { title }, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  getWatchlists(): Observable<any> {
    return this.http.get(`${this.apiUrl}get_watchlists/`, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  updateWatchlist(watchlistId: number, newTitle: string): Observable<any> {
    return this.http.put(`${this.apiUrl}update_watchlist/${watchlistId}/`, { title: newTitle }, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  deleteWatchlist(watchlistId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}delete_watchlist/${watchlistId}/`, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  addAnimeToWatchlist(watchlistId: number, animeId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}add-anime-to-watchlist/`, { anime_id: animeId, watchlist_id: watchlistId }, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  getAnimeByWatchlist(watchlistId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}get-anime-by-watchlist/${watchlistId}/`, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  deleteAnimeFromWatchlist(animeId: number, watchlistId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}delete-anime-from-watchlist/${animeId}/${watchlistId}/`, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }
}
