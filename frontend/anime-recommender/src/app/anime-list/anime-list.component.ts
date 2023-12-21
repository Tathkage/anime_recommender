import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AnimeService } from '../services/anime.service';

@Component({
  selector: 'anime-list',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './anime-list.component.html',
  styleUrl: './anime-list.component.css'
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
