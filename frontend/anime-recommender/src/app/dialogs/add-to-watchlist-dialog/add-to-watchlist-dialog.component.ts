import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { WatchlistService } from '../../services/watchlist.service';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-to-watchlist-dialog',
  templateUrl: './add-to-watchlist-dialog.component.html',
  styleUrls: ['./add-to-watchlist-dialog.component.css'],
  standalone: true,
  imports: [
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
    private watchlistService: WatchlistService
  ) {}

  ngOnInit(): void {
    this.watchlistService.getWatchlists().subscribe(data => {
      this.watchlists = data;
    });
  }

  onAdd(): void {
    if (this.watchlistForm.value.newWatchlist) {
      // Create new watchlist and add anime to it
      this.watchlistService.createWatchlist(this.watchlistForm.value.newWatchlist).subscribe(response => {
        this.watchlistService.addAnimeToWatchlist(response.watchlist_id, this.data.anime.id).subscribe(() => {
          this.dialogRef.close();
        });
      });
    } else {
      // Add anime to existing watchlist
      const selectedWatchlistId = Number(this.watchlistForm.value.selectedWatchlist); // Convert to number
      this.watchlistService.addAnimeToWatchlist(selectedWatchlistId, this.data.anime.id).subscribe(() => {
        this.dialogRef.close();
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
