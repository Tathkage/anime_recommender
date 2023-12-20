import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'user-watchlist',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './user-watchlist.component.html',
  styleUrl: './user-watchlist.component.css'
})
export class UserWatchlistComponent {
  title = 'anime-recommender';
}
