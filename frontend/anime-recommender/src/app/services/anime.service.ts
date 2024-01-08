import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Anime } from '../anime-list/anime-list.component';

@Injectable({
  providedIn: 'root'
})
export class AnimeService {
  private apiUrl = 'http://localhost:8000/api/';

  constructor(private http: HttpClient) { }

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

  getAnimeList(genreNames: string[]): Observable<any> {
    let params = new HttpParams();
    genreNames.forEach(genre => {
      params = params.append('genres', genre);
    });
    return this.http.get(`${this.apiUrl}genre-scraper/`, { params })
      .pipe(catchError(this.handleError));
  }

  addAnimeToDatabase(anime: Anime): Observable<any> {
    return this.http.post(`${this.apiUrl}get-or-create-anime/`, anime, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }  

  addOrFindAnime(anime: any): Observable<any> {
    const animeData = {
      anime_title: anime.Title,
      release_year: anime['Release Year'],
      num_episodes: anime['Episode Count'],
      time_per_episode: anime['Episode Length'],
      anime_rating: anime.Rating,
      description: anime.Description,
      status: anime.Status,
    };
    return this.http.post(`${this.apiUrl}add-or-find-anime/`, animeData, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }
}
