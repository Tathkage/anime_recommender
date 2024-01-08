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
  watchlistForm: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<AddToWatchlistDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private watchlistService: WatchlistService,
    private animeService: AnimeService,
    private cdr: ChangeDetectorRef
  ) {
    this.watchlistForm = new FormGroup({
      selectedWatchlist: new FormControl(''),
      newWatchlist: new FormControl('')
    });
  }

  ngOnInit(): void {
    this.loadWatchlists();
    this.setupFormValueChanges();
  }

  // Load watchlists from the service
  private loadWatchlists(): void {
    this.watchlistService.getWatchlists().subscribe(
      data => {
        this.watchlists = data;
      },
      error => console.error("Error loading watchlists:", error)
    );
  }

  // Setup form value changes listeners
  private setupFormValueChanges(): void {
    this.watchlistForm.get('selectedWatchlist')?.valueChanges.subscribe(value => {
      this.toggleFormFields('newWatchlist', value);
    });

    this.watchlistForm.get('newWatchlist')?.valueChanges.subscribe(value => {
      this.toggleFormFields('selectedWatchlist', value);
    });
  }

  // Toggle form fields based on the current value
  private toggleFormFields(fieldToDisable: string, condition: any): void {
    const control = this.watchlistForm.get(fieldToDisable);
    condition ? control?.disable() : control?.enable();
  }

  // Add Anime to Watchlist
  onAdd(): void {
    const animeId = this.data.anime.id;
    if (!animeId) {
      this.animeService.addOrFindAnime(this.data.anime).subscribe(
        response => this.processAnimeAddition(response.anime_id),
        error => console.error("Error adding or finding anime:", error)
      );
    } else {
      this.processAnimeAddition(animeId);
    }
  }

  // Process the addition of Anime to a Watchlist
  private processAnimeAddition(animeId: number): void {
    if (this.watchlistForm.value.newWatchlist) {
      this.createWatchlistAndAddAnime(animeId);
    } else {
      this.addAnimeToExistingWatchlist(animeId);
    }
  }

  // Create a new Watchlist and add Anime to it
  private createWatchlistAndAddAnime(animeId: number): void {
    this.watchlistService.createWatchlist(this.watchlistForm.value.newWatchlist).subscribe(
      response => this.addAnimeToWatchlist(response.id, animeId),
      error => console.error("Error creating watchlist:", error)
    );
  }

  // Add Anime to an existing Watchlist
  private addAnimeToExistingWatchlist(animeId: number): void {
    const watchlistId = this.watchlistForm.value.selectedWatchlist;
    this.addAnimeToWatchlist(watchlistId, animeId);
  }

  // Add Anime to a Watchlist
  private addAnimeToWatchlist(watchlistId: number, animeId: number): void {
    this.watchlistService.addAnimeToWatchlist(watchlistId, animeId).subscribe(
      () => this.dialogRef.close(),
      error => console.error("Error adding anime to watchlist:", error)
    );
  }

  // Close the dialog
  onCancel(): void {
    this.dialogRef.close();
  }
}
