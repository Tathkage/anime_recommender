export interface Anime {
    Title: string;
    Rating: string;
    Status: string;
    'Episode Count': number;
    'Episode Length': number;
    'Release Year': number;
    Description: string;
    isExpanded?: boolean;
}
  
export interface AnimeData {
    'Anime Info': Anime[];
}
  