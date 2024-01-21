export interface Watchlist {
    id: number;
    title: string;
    watchlist_id?: number;
    watchlist_title?: string;
  }
  
  export interface AnimeInWatchlist {
    animeId: number;
    watchlistId: number;
  }
  