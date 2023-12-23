import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { AnimeService } from '../services/anime.service';
import { AuthService } from '../services/auth.service';

interface Anime {
  Title: string;
  Rating: string;
  Status: string;
  'Episode Count': string;
  'Episode Length': string;
  'Release Year': string;
  Description: string;
}


interface AnimeData {
  'Anime Info': Anime[];
}

@Component({
  selector: 'anime-list',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './anime-list.component.html',
  styleUrls: ['./anime-list.component.css']
})

export class AnimeListComponent implements OnInit {
  animeList: Anime[] = [];
  selectedGenreNumber: string = "1"; // Default genre number is 1 for Action
  selectedGenreName: string = "Action"; // Default genre is Action

  constructor(private animeService: AnimeService, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {}

  getAnimeList(): void {
    this.animeService.getAnimeList(this.selectedGenreNumber, this.selectedGenreName).subscribe((data: AnimeData) => {
      this.animeList = data['Anime Info'];
    });
  }

  onGenreChange(selectedGenreName: string): void {
    const genreMap: { [key: string]: string } = {
      'Action': '1',
      'Adventure': '2',
      'Avant Garde': '5',
      'Award Winning': '46',
      'Boys Love': '28',
      'Comedy': '4',
      'Drama': '8',
      'Fantasy': '10',
      'Girls Love': '26',
      'Gourmet': '47',
      'Horror': '14',
      'Mystery': '7',
      'Romance': '22',
      'Sci-Fi': '24',
      'Slice of Life': '36',
      'Sports': '30',
      'Supernatural': '37',
      'Suspense': '41',
    };

    console.log("Selected Genre:", selectedGenreName)
    console.log("Genre Number:", genreMap[selectedGenreName])
    this.selectedGenreName = selectedGenreName;
    this.selectedGenreNumber = genreMap[selectedGenreName];
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/user-login']);
  }

  navigateToWatchlist(): void {
    this.router.navigate(['/user-watchlist']);
  }
}
