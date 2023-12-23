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

  constructor(private animeService: AnimeService, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {}

  getAnimeList(): void {
    this.animeService.getAnimeList().subscribe((data: AnimeData) => {
      this.animeList = data['Anime Info'];
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/user-login']);
  }

  navigateToWatchlist(): void {
    this.router.navigate(['/user-watchlist']);
  }
}
