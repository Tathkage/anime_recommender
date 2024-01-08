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
    selectedWatchlist: new FormControl(''),
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
        console.log("Watchlists Loaded:", this.watchlists); // Debugging
    }, error => {
        console.error("Error loading watchlists:", error); // Error handling
    });

    // Add value change listener
    this.watchlistForm.get('selectedWatchlist')!.valueChanges.subscribe(value => {
      if (value) {
        this.watchlistForm.get('newWatchlist')!.disable();
      } else {
        this.watchlistForm.get('newWatchlist')!.enable();
      }
    });

    this.watchlistForm.get('newWatchlist')!.valueChanges.subscribe(value => {
      if (value) {
        this.watchlistForm.get('selectedWatchlist')!.disable();
      } else {
        this.watchlistForm.get('selectedWatchlist')!.enable();
      }
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
    console.log("Form Values:", this.watchlistForm.value);
  
    // Check if a new watchlist title is provided
    if (this.watchlistForm.value.newWatchlist) {
      // Create a new watchlist first
      this.watchlistService.createWatchlist(this.watchlistForm.value.newWatchlist).subscribe(newWatchlistResponse => {
        // After the new watchlist is created, get its ID
        const newWatchlistId = newWatchlistResponse.watchlist_id;
  
        console.log("New Watchlist ID:", newWatchlistId);
  
        if (typeof newWatchlistId === 'number') {
          this.watchlistService.addAnimeToWatchlist(newWatchlistId, animeId).subscribe(() => {
            this.dialogRef.close();
          });
        }        
      });
    } else {
      // Use the selected watchlist
      const watchlistId = Number(this.watchlistForm.value.selectedWatchlist);
      console.log("Selected Watchlist ID:", watchlistId);
  
      // Add the anime to the selected watchlist
      this.watchlistService.addAnimeToWatchlist(watchlistId, animeId).subscribe(() => {
        this.dialogRef.close();
      });
    }
  }  

  onCancel(): void {
    this.dialogRef.close();
  }
}
