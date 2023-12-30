import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Anime } from '../anime-list/anime-list.component';

@Injectable({
  	providedIn: 'root'
})

export class AnimeService {
	private apiUrl = 'http://localhost:8000/api/';

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
		return this.http.get(`${this.apiUrl}genre-scraper/`, { params });
	}

	addAnimeToDatabase(anime: Anime): Observable<any> {
		return this.http.post(`${this.apiUrl}get-or-create-anime/`, anime, { headers: this.getHeaders() });
	}

	addOrFindAnime(anime: any): Observable<any> {
		const animeData = {
			title: anime.Title,
			releaseYear: anime['Release Year'],
			episodeCount: anime['Episode Count'],
			episodeLength: anime['Episode Length'],
			rating: anime.Rating,
			description: anime.Description,
			status: anime.Status,
		}
		return this.http.post(`${this.apiUrl}add-or-find-anime/`, animeData, { headers: this.getHeaders() });
	  }
	  
}
