import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnimeService {
  private apiUrl = 'http://localhost:8000/api/temp-scraper/';

  constructor(private http: HttpClient) { }

  getAnimeList(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}
