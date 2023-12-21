import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule
import { AnimeService } from '../services/anime.service';

@Component({
  selector: 'anime-list',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HttpClientModule], // Add HttpClientModule here
  templateUrl: './anime-list.component.html',
  styleUrls: ['./anime-list.component.css'] // Correct 'styleUrl' to 'styleUrls'
})
export class AnimeListComponent implements OnInit {
  animeList: any[] = [];

  constructor(private animeService: AnimeService) {}

  ngOnInit(): void {
    this.animeService.getAnimeList().subscribe(data => {
      this.animeList = data['Anime Info'];
    });
  }
}
