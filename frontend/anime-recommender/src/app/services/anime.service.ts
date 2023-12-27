import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Anime } from '../anime-list/anime-list.component';

@Injectable({
  	providedIn: 'root'
})

export class AnimeService {
	private apiUrl = 'http://localhost:8000/api/genre-scraper/';

	constructor(private http: HttpClient) { }

	private getHeaders(): HttpHeaders {
		const token = localStorage.getItem('userToken');
		return new HttpHeaders({
			'Content-Type': 'application/json',
			'Authorization': `Token ${token}`
		});
	}

	getAnimeList(genreNames: string[]): Observable<any> {
		let params = new HttpParams();
		genreNames.forEach(genre => {
			params = params.append('genres', genre);
		});

		console.log('URL:', this.apiUrl, 'Params:', params.toString());
		return this.http.get(this.apiUrl, { params });
	}

	addAnimeToDatabase(anime: Anime): Observable<any> {
		return this.http.post(`${this.apiUrl}get-or-create-anime/`, anime, { headers: this.getHeaders() });
	}
}
