import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'user-watchlist',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './user-watchlist.component.html',
  styleUrl: './user-watchlist.component.css'
})

export class UserWatchlistComponent {
  
  constructor(private authService: AuthService, private router: Router) {}

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/user-login']);
  }
}
