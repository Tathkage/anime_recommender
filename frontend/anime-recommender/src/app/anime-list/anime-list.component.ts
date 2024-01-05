import { Component, OnInit, Renderer2, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms'
import { AnimeService } from '../services/anime.service';
import { AuthService } from '../services/auth.service';
import { WatchlistService } from '../services/watchlist.service';
import { GenreSelectionDialogComponent } from '../dialogs/genre-selection-dialog/genre-selection-dialog.component';
import { AddToWatchlistDialogComponent } from '../dialogs/add-to-watchlist-dialog/add-to-watchlist-dialog.component';


export interface Anime {
	Title: string;
	Rating: string;
	Status: string;
	'Episode Count': string;
	'Episode Length': string;
	'Release Year': string;
	Description: string;
	isExpanded?: boolean;
}

interface AnimeData {
  	'Anime Info': Anime[];
}

@Component({
	selector: 'anime-list',
	standalone: true,
	imports: [CommonModule, RouterOutlet, FormsModule],
	templateUrl: './anime-list.component.html',
	styleUrls: ['./anime-list.component.css']
})

export class AnimeListComponent implements OnInit {
	animeList: Anime[] = [];
	selectedGenres: string[] = [];
	currentPage: number = 1;
	itemsPerPage: number = 100;
	totalPages: number = 0;
	isLoading: boolean = false;
	useAPI: boolean = false;

	constructor(
		private animeService: AnimeService,
		private dialog: MatDialog,
		private authService: AuthService,
		private watchlistService: WatchlistService,
		private router: Router,
		private renderer: Renderer2,
		private el: ElementRef
	) {}

	ngOnInit(): void {
		
	}

	navigateToWatchlist(): void {
		this.router.navigate(['/user-watchlist']);
	}

	navigateToUserSettings(): void {
		this.router.navigate(['/user-settings']);
	}

	getAnimeList(): void {
		this.isLoading = true; // Start loading, show the spinner
		this.animeService.getAnimeList(this.selectedGenres).subscribe((data: AnimeData) => {
			this.animeList = data['Anime Info'].map(anime => ({...anime, isExpanded: false}));
			this.totalPages = Math.ceil(this.animeList.length / this.itemsPerPage);
			this.currentPage = 1;
			this.isLoading = false; // Data loaded, hide the spinner
		});
	}

	toggleDescription(index: number): void {
		if (this.animeList[index].isExpanded === undefined) {
			this.animeList[index].isExpanded = false;
		}

		this.animeList[index].isExpanded = !this.animeList[index].isExpanded;
	}

	resetDescriptions(): void{
		this.animeList = this.animeList.map(anime => {
			if (anime.isExpanded) {
				return {...anime, isExpanded: false};
			}
			return anime;
		})
	}

	nextPage(): void {
		if (this.currentPage < this.totalPages) {
			this.currentPage++;
			this.resetDescriptions();
			console.log('Current Page:', this.currentPage);
		}
	}

	previousPage(): void {
		if (this.currentPage > 1) {
			this.currentPage--;
			this.resetDescriptions();
			console.log('Current Page:', this.currentPage);
		}
	}
	
	openGenreSelectionDialog(): void {
		const dialogRef = this.dialog.open(GenreSelectionDialogComponent, {
			width: '250px',
			data: { selectedGenres: this.selectedGenres }
		});
	
		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.selectedGenres = result;  
				console.log('Selected Genres:', this.selectedGenres);
			}
		});
	  }

	openAddToWatchlistDialog(anime: Anime): void {
		const dialogRef = this.dialog.open(AddToWatchlistDialogComponent, {
		  width: '400px',
		  data: { anime }
		});
	
		dialogRef.afterClosed().subscribe(result => {
		  if (result) {
			this.animeService.addAnimeToDatabase(anime).subscribe(animeResponse => {
			  const animeId = animeResponse.anime_id;
			  this.watchlistService.addAnimeToWatchlist(result.watchlistId, animeId).subscribe(response => {
				console.log('Anime added to watchlist:', response.message);
			  });
			});
		  }
		});
	}

	onLogout(): void {
		this.authService.logout();
		this.router.navigate(['/user-login']);
	}
}
