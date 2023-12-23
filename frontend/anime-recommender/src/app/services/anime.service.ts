import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AnimeService {
  private apiUrl = 'http://localhost:8000/api/temp-scraper/';

  constructor(private http: HttpClient) { }

  getAnimeList(genreNumber: string, genreName: string): Observable<any> {
    const url = `${this.apiUrl}${genreNumber}/${genreName}/`;
    console.log('URL:', url);
    return this.http.get(url);
  }
}
