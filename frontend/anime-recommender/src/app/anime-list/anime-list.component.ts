import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'anime-list',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './anime-list.component.html',
  styleUrl: './anime-list.component.css'
})
export class AnimeListComponent {
  title = 'anime-recommender';
}
