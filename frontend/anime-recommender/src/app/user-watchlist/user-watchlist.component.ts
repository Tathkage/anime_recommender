import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { WatchlistService } from '../services/watchlist.service';
import { MatDialog } from '@angular/material/dialog';
import { ViewWatchlistDialogComponent } from '../dialogs/view-watchlist-dialog/view-watchlist-dialog.component';

interface Watchlist {
  watchlist_id: number;
  watchlist_title: string;
}

@Component({
  selector: 'user-watchlist',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './user-watchlist.component.html',
  styleUrl: './user-watchlist.component.css'
})

export class UserWatchlistComponent implements OnInit {
  watchlists: Watchlist[] = [];
  showCreatePopup = false;
  showUpdatePopup = false;
  selectedWatchlistId: number | null = null;

  constructor(
    private watchlistService: WatchlistService, 
    private authService: AuthService, 
    private router: Router,
    private dialog: MatDialog,
    ) {}

  ngOnInit() {
    this.getWatchlists();
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/user-login']);
  }

  navigateToAnimeList(): void {
    this.router.navigate(['/anime-list']);
  }

  viewWatchlist(watchlistId: number): void {
    const dialogRef = this.dialog.open(ViewWatchlistDialogComponent, {
      width: '400px',
      data: { watchlistId: watchlistId }
    });

    dialogRef.afterClosed().subscribe(result => {});
  }

  createWatchlist(title: string): void {
    this.watchlistService.createWatchlist(title).subscribe(() => {
      this.getWatchlists();
    });
  }

  getWatchlists(): void {
    this.watchlistService.getWatchlists().subscribe(data => this.watchlists = data);
  }

  updateWatchlist(watchlistId: number | null, newTitle: string): void {
    if (watchlistId !== null) {
      this.watchlistService.updateWatchlist(watchlistId, newTitle).subscribe(() => this.getWatchlists());
    }
  }

  deleteWatchlist(watchlistId: number): void {
    if (confirm('Are you sure you want to delete this watchlist?')) {
      this.watchlistService.deleteWatchlist(watchlistId).subscribe(() => this.getWatchlists());
    }
  }

  showUpdateWatchlistPopup(watchlistId: number): void {
    this.selectedWatchlistId = watchlistId;
    this.showUpdatePopup = true;
  }

  confirmDeleteWatchlist(watchlistId: number): void {
    const confirmed = confirm('Are you sure you want to delete this watchlist?');
    if (confirmed) {
      this.deleteWatchlist(watchlistId);
    }
  }

  showCreateWatchlistPopup(): void {
    this.showCreatePopup = true;
  }
}
