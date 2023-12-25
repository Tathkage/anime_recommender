import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  	providedIn: 'root'
})

export class AnimeService {
	// private apiUrl = 'http://localhost:8000/api/temp-scraper/';
	private apiUrl = 'http://localhost:8000/api/genre-scraper/';

	constructor(private http: HttpClient) { }

	// getAnimeList(genreNumber: string, genreName: string): Observable<any> {
	// 	const url = `${this.apiUrl}${genreNumber}/${genreName}/`;
	// 	console.log('URL:', url);
	// 	return this.http.get(url);
	// }

	getAnimeList(genreNames: string[]): Observable<any> {
		let params = new HttpParams();
		genreNames.forEach(genre => {
			params = params.append('genres', genre);
		});

		console.log('URL:', this.apiUrl, 'Params:', params.toString());
		return this.http.get(this.apiUrl, { params });
	}
}
