import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
	selector: 'app-genre-selection-dialog',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './genre-selection-dialog.component.html',
	styleUrls: ['./genre-selection-dialog.component.css']
})

export class GenreSelectionDialogComponent {
	genres = [
		{ name: 'Action', value: '1' },
		{ name: 'Adventure', value: '2' },
		{ name: 'Avant Garde', value: '5'},
		{ name: 'Award Winning', value: '46'},
		{ name: 'Boys Love', value: '28'},
		{ name: 'Comedy', value: '4'},
		{ name: 'Drama', value: '8'},
		{ name: 'Fantasy', value: '10'},
		{ name: 'Girls Love', value: '26'},
		{ name: 'Gourmet', value: '47'},
		{ name: 'Horror', value: '14'},
		{ name: 'Mystery', value: '7'},
		{ name: 'Romance', value: '22'},
		{ name: 'Sci-Fi', value: '24'},
		{ name: 'Slice of Life', value: '36'},
		{ name: 'Sports', value: '30'},
		{ name: 'Supernatural', value: '37'},
		{ name: 'Suspense', value: '41'}
	];
	selectedGenres: string[] = [];

	constructor(public dialogRef: MatDialogRef<GenreSelectionDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
		if (data.selectedGenres) {
			this.selectedGenres = data.selectedGenres ? [...data.selectedGenres] : [];
		}
	}

	onGenreCheckboxChange(genreValue: string, event: any): void {
		if (event.target.checked) {
			this.selectedGenres.push(genreValue);
		} 
		else {
			this.selectedGenres = this.selectedGenres.filter(g => g !== genreValue);
		}
	}

	confirmSelection(): void {
		this.dialogRef.close(this.selectedGenres);
	}
}
