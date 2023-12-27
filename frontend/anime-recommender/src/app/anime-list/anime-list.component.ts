import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { AnimeService } from '../services/anime.service';
import { AuthService } from '../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { GenreSelectionDialogComponent } from '../dialogs/genre-selection-dialog.component';


interface Anime {
	Title: string;
	Rating: string;
	Status: string;
	'Episode Count': string;
	'Episode Length': string;
	'Release Year': string;
	Description: string;
}

interface AnimeData {
  	'Anime Info': Anime[];
}

@Component({
	selector: 'anime-list',
	standalone: true,
	imports: [CommonModule, RouterOutlet],
	templateUrl: './anime-list.component.html',
	styleUrls: ['./anime-list.component.css']
})

export class AnimeListComponent implements OnInit {
	animeList: Anime[] = [];
	selectedGenres: string[] = [];
	currentPage: number = 1;
	itemsPerPage: number = 100;
	totalPages: number = 0;

	constructor(private animeService: AnimeService,  private dialog: MatDialog, private authService: AuthService, private router: Router) {}

	ngOnInit(): void {
		
	}

	getAnimeList(): void {
		this.animeService.getAnimeList(this.selectedGenres).subscribe((data: AnimeData) => {
			this.animeList = data['Anime Info'];
			this.totalPages = Math.ceil(this.animeList.length / this.itemsPerPage);
			this.currentPage = 1;
		})
	}

	nextPage(): void {
		if (this.currentPage < this.totalPages) {
			this.currentPage++;
			console.log('Current Page:', this.currentPage);
		}
	}

	previousPage(): void {
		if (this.currentPage > 1) {
			this.currentPage--;
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

	onLogout(): void {
		this.authService.logout();
		this.router.navigate(['/user-login']);
	}

	navigateToWatchlist(): void {
		this.router.navigate(['/user-watchlist']);
	}
}
