import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AnimeService } from '../services/anime.service';

interface Anime {
  Title: string;
  Rating: string;
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

  constructor(private animeService: AnimeService) {}

  ngOnInit(): void {
    this.animeService.getAnimeList().subscribe((data: AnimeData) => {
      this.animeList = data['Anime Info'];
    });
  }
}
