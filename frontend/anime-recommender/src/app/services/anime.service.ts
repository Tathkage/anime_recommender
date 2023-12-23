import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AnimeService {
  private apiUrl = 'http://localhost:8000/api/top-anime/';
  // private apiUrl = 'http://localhost:8000/api/specific-anime'; not sure if this api needs its own class rn

  constructor(private http: HttpClient) { }

  getAnimeList(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}
