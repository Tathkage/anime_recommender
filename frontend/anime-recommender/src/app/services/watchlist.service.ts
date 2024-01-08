import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Watchlist, AnimeInWatchlist } from '../models/watchlist.model';

@Injectable({
  providedIn: 'root'
})
export class WatchlistService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse): Observable<never> {
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

  createWatchlist(title: string): Observable<Watchlist> {
    // Validate title before sending the request
    if (!title || title.trim() === '') {
      return throwError('Invalid watchlist title');
    }

    return this.http.post<Watchlist>(`${this.apiUrl}create_watchlist/`, { title }, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  getWatchlists(): Observable<Watchlist[]> {
    return this.http.get<Watchlist[]>(`${this.apiUrl}get_watchlists/`, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  updateWatchlist(watchlistId: number, newTitle: string): Observable<Watchlist> {
    // Validate watchlistId and newTitle before sending the request
    if (!newTitle || newTitle.trim() === '' || isNaN(watchlistId)) {
      return throwError('Invalid data for updating watchlist');
    }

    return this.http.put<Watchlist>(`${this.apiUrl}update_watchlist/${watchlistId}/`, { title: newTitle }, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  deleteWatchlist(watchlistId: number): Observable<{ message: string }> {
    // Validate watchlistId before sending the request
    if (isNaN(watchlistId)) {
      return throwError('Invalid watchlist ID');
    }

    return this.http.delete<{ message: string }>(`${this.apiUrl}delete_watchlist/${watchlistId}/`, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  addAnimeToWatchlist(watchlistId: number, animeId: number): Observable<AnimeInWatchlist> {
    // Validate watchlistId and animeId before sending the request
    if (isNaN(watchlistId) || isNaN(animeId)) {
      return throwError('Invalid watchlist or anime ID');
    }

    return this.http.post<AnimeInWatchlist>(`${this.apiUrl}add-anime-to-watchlist/`, { anime_id: animeId, watchlist_id: watchlistId }, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  getAnimeByWatchlist(watchlistId: number): Observable<any> { // Specify a more specific return type if possible
    if (isNaN(watchlistId)) {
      return throwError('Invalid watchlist ID');
    }

    return this.http.get<any>(`${this.apiUrl}get-anime-by-watchlist/${watchlistId}/`, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  deleteAnimeFromWatchlist(animeId: number, watchlistId: number): Observable<{ message: string }> {
    if (isNaN(watchlistId) || isNaN(animeId)) {
      return throwError('Invalid watchlist or anime ID');
    }

    return this.http.delete<{ message: string }>(`${this.apiUrl}delete-anime-from-watchlist/${animeId}/${watchlistId}/`, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }
}
