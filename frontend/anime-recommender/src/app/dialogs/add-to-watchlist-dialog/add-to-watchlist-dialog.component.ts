import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { WatchlistService } from '../../services/watchlist.service';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { AnimeService } from '../../services/anime.service';

@Component({
  selector: 'app-add-to-watchlist-dialog',
  templateUrl: './add-to-watchlist-dialog.component.html',
  styleUrls: ['./add-to-watchlist-dialog.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule
  ],
})

export class AddToWatchlistDialogComponent implements OnInit {
  watchlists: any[] = [];
  watchlistForm = new FormGroup({
    selectedWatchlist: new FormControl('', Validators.required),
    newWatchlist: new FormControl('')
  });

  constructor(
    private dialogRef: MatDialogRef<AddToWatchlistDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private watchlistService: WatchlistService,
    private cdr: ChangeDetectorRef,
    private animeService: AnimeService
  ) {}

  ngOnInit(): void {
    this.watchlistService.getWatchlists().subscribe(data => {
        this.watchlists = data;
        this.cdr.detectChanges();
        console.log("Watchlists Loaded:", this.watchlists); // Debugging
    }, error => {
        console.error("Error loading watchlists:", error); // Error handling
    });
  }

  onAdd(): void {
    if (!this.data.anime.id) {
      // Call a method to add/find the anime in the database and get its id
      this.animeService.addOrFindAnime(this.data.anime).subscribe(animeResponse => {
        this.addAnimeToWatchlist(animeResponse.anime_id);
      });
    } else {
      this.addAnimeToWatchlist(this.data.anime.id);
    }
  }
  
  private addAnimeToWatchlist(animeId: number): void {
    const watchlistId = this.watchlistForm.value.newWatchlist
      ? Number(this.watchlistForm.value.newWatchlist)
      : Number(this.watchlistForm.value.selectedWatchlist);
  
    this.watchlistService.addAnimeToWatchlist(watchlistId, animeId).subscribe(() => {
      this.dialogRef.close();
    });
  }  

  onCancel(): void {
    this.dialogRef.close();
  }
}
