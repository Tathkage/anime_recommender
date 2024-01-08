import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Anime } from '../models/anime.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnimeService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Public methods for HTTP requests
  getAnimeList(genreNames: string[]): Observable<any> {
    let params = new HttpParams();
    genreNames.forEach(genre => {
      params = params.append('genres', genre);
    });
    return this.http.get(`${this.apiUrl}genre-scraper/`, { params })
      .pipe(catchError(this.handleError));
  }

  addAnimeToDatabase(anime: Anime): Observable<any> {
    if (!this.isValidAnime(anime)) {
      return throwError('Invalid anime data');
    }
    return this.http.post(`${this.apiUrl}get-or-create-anime/`, anime, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  addOrFindAnime(anime: any): Observable<any> {
    if (!this.isValidAnime(anime)) {
      return throwError('Invalid anime data');
    }
    const animeData = this.mapAnimeToData(anime);
    return this.http.post(`${this.apiUrl}add-or-find-anime/`, animeData, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  // Private utility methods
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

  private isValidAnime(anime: Anime): boolean {
    // Check all required fields for validity
    const isTitleValid = typeof anime.Title === 'string' && anime.Title.trim() !== '';
    const isRatingValid = typeof anime.Rating === 'string' && anime.Rating.trim() !== '';
    const isStatusValid = typeof anime.Status === 'string' && anime.Status.trim() !== '';
    const isEpisodeCountValid = typeof anime['Episode Count'] === 'number' && !isNaN(anime['Episode Count']);
    const isEpisodeLengthValid = typeof anime['Episode Length'] === 'number' && !isNaN(anime['Episode Length']);
    const isReleaseYearValid = typeof anime['Release Year'] === 'number' && !isNaN(anime['Release Year']);
    const isDescriptionValid = typeof anime.Description === 'string';
  
    // Return true only if all conditions are true
    return isTitleValid && isRatingValid && isStatusValid && 
           isEpisodeCountValid && isEpisodeLengthValid && 
           isReleaseYearValid && isDescriptionValid;
  }

  private mapAnimeToData(anime: any): any {
    return {
      anime_title: anime.Title,
      release_year: anime['Release Year'],
      num_episodes: anime['Episode Count'],
      time_per_episode: anime['Episode Length'],
      anime_rating: anime.Rating,
      description: anime.Description,
      status: anime.Status,
    };
  }
}
