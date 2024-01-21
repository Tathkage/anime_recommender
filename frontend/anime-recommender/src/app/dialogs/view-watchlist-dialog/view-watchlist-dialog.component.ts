import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { WatchlistService } from '../../services/watchlist.service'

@Component({
  selector: 'app-view-watchlist-dialog',
  templateUrl: './view-watchlist-dialog.component.html',
  styleUrls: ['./view-watchlist-dialog.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
  ],
})

export class ViewWatchlistDialogComponent implements OnInit {
  animeList: any[] = [];

  constructor(
    private dialogRef: MatDialogRef<ViewWatchlistDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private watchlistService: WatchlistService  // Inject WatchlistService
  ) {}

  ngOnInit(): void {
    if (this.data.watchlistId) {
      this.watchlistService.getAnimeByWatchlist(this.data.watchlistId).subscribe(animeListResponse => {
        this.animeList = animeListResponse;
        console.log(this.animeList);
      }, error => {
        console.error("Error fetching anime list:", error);
      });
    }
  }

  deleteAnime(animeId: number): void {
    this.watchlistService.deleteAnimeFromWatchlist(animeId, this.data.watchlistId).subscribe(() => {
      this.animeList = this.animeList.filter(anime => anime.anime_id !== animeId);
    }, error => {
      console.error("Error deleting anime:", error);
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
