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

  // Creates a new watchlist
  createWatchlist(title: string): Observable<Watchlist> {
    if (!title || title.trim() === '') {
      return throwError('Invalid watchlist title');
    }
    return this.http.post<Watchlist>(`${this.apiUrl}create_watchlist/`, { title }, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  // Retrieves all watchlists
  getWatchlists(): Observable<Watchlist[]> {
    return this.http.get<Watchlist[]>(`${this.apiUrl}get_watchlists/`, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  // Updates a specific watchlist
  updateWatchlist(watchlistId: number, newTitle: string): Observable<Watchlist> {
    if (!newTitle || newTitle.trim() === '' || isNaN(watchlistId)) {
      return throwError('Invalid data for updating watchlist');
    }
    return this.http.put<Watchlist>(`${this.apiUrl}update_watchlist/${watchlistId}/`, { title: newTitle }, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  // Deletes a specific watchlist
  deleteWatchlist(watchlistId: number): Observable<{ message: string }> {
    if (isNaN(watchlistId)) {
      return throwError('Invalid watchlist ID');
    }
    return this.http.delete<{ message: string }>(`${this.apiUrl}delete_watchlist/${watchlistId}/`, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  // Adds an anime to a watchlist
  addAnimeToWatchlist(watchlistId: number, animeId: number): Observable<AnimeInWatchlist> {
    if (isNaN(watchlistId) || isNaN(animeId)) {
      return throwError('Invalid watchlist or anime ID');
    }
    return this.http.post<AnimeInWatchlist>(`${this.apiUrl}add-anime-to-watchlist/`, { anime_id: animeId, watchlist_id: watchlistId }, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  // Retrieves anime by watchlist ID
  getAnimeByWatchlist(watchlistId: number): Observable<any> { // Update the return type if possible
    if (isNaN(watchlistId)) {
      return throwError('Invalid watchlist ID');
    }
    return this.http.get<any>(`${this.apiUrl}get-anime-by-watchlist/${watchlistId}/`, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  // Deletes an anime from a watchlist
  deleteAnimeFromWatchlist(animeId: number, watchlistId: number): Observable<{ message: string }> {
    if (isNaN(watchlistId) || isNaN(animeId)) {
      return throwError('Invalid watchlist or anime ID');
    }
    return this.http.delete<{ message: string }>(`${this.apiUrl}delete-anime-from-watchlist/${animeId}/${watchlistId}/`, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  // Error handling for HTTP requests
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error has occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server error ${error.status}: ${error.statusText}`;
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }
}
