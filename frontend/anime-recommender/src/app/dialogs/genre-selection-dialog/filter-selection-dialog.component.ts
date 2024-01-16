import { Component, Inject, ElementRef, Renderer2, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { FormsModule } from '@angular/forms';

@Component({
	selector: 'app-genre-selection-dialog',
	standalone: true,
	imports: [CommonModule, MatTabsModule, FormsModule],
	templateUrl: './filter-selection-dialog.component.html',
	styleUrls: ['./filter-selection-dialog.component.css']
})

export class FilterSelectionDialogComponent implements AfterViewInit, OnDestroy {
	private scrollTimeout: any;

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

	studios = [
		{ name: 'Toei Animation' },
		{ name: 'Discotek Media' },
		{ name: 'TMS Entertainment' },
		{ name: 'Studio Deen' },
		{ name: 'Pierrot' },
		{ name: 'OLM' },
		{ name: 'AIC' },
		{ name: 'TBS' },
		{ name: 'A-1 Pictures' },
		{ name: 'Shin-Ei Animation' },
		{ name: 'bilibili' },
		{ name: 'DLE' },
		{ name: 'Bandai Entertainment' },
		{ name: 'Tatsunoko Production' },
		{ name: 'Tencent Penguin Pictures' },
		{ name: 'Shogakukan-Shueisha Productions' },
		{ name: 'Wit Studio' },
		{ name: 'MAPPA' },
		{ name: 'Ufotable' } // placeholders - several more studios need to be added
	]

	selectedGenres: string[] = [];
	selectedStudios: string[] = [];
	searchText: string = '';

	constructor(public dialogRef: MatDialogRef<FilterSelectionDialogComponent>, 
		@Inject(MAT_DIALOG_DATA) public data: any,
		private el: ElementRef,
		private renderer: Renderer2
	) {
		if (data.selectedGenres) {
			this.selectedGenres = data.selectedGenres ? [...data.selectedGenres] : [];
		}
	}

	onGenreCheckboxChange(genreName: string, event: any): void {
		if (event.target.checked) {
			this.selectedGenres.push(genreName);
		} 
		else {
			this.selectedGenres = this.selectedGenres.filter(g => g !== genreName);
		}
	}

	onStudioCheckboxChange(studioName: string, event: any): void {
		if (event.target.checked) {
			this.selectedStudios.push(studioName);
		} 
		else {
			this.selectedStudios = this.selectedStudios.filter(g => g !== studioName);
		}
	}

	get filteredGenres() {
		return this.genres.filter(genre => genre.name.toLowerCase().includes(this.searchText.toLowerCase()));
	}

	get filteredStudios() {
		return this.studios.filter(studio => studio.name.toLowerCase().includes(this.searchText.toLowerCase()));
	}

	resetSearchBar(): void {
		this.searchText = '';
	}

	confirmSelection(): void {
		this.dialogRef.close(this.selectedGenres);
	}

	ngAfterViewInit(): void {
		// const scrollableContent = this.el.nativeElement.querySelector('.scrollable-content');
		// this.renderer.listen(scrollableContent, 'scroll', () => {
		// 	this.renderer.addClass(scrollableContent, 'scrolling');
		// 	clearTimeout(this.scrollTimeout);
		// 	this.scrollTimeout = setTimeout(() => {
		// 		this.renderer.removeClass(scrollableContent, 'scrolling');
		// 	}, 2500);
		// });
	}

	ngOnDestroy(): void {
		clearTimeout(this.scrollTimeout);
	}
}
