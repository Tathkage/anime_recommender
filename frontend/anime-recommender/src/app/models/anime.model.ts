export interface Anime {
    Title: string;
    Rating: string;
    Status: string;
    EpisodeCount: number;
    EpisodeLength: number;
    ReleaseYear: number;
    Description: string;
}
  
export interface AnimeData {
    'Anime Info': Anime[];
}
  