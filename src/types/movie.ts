export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  name: string;
}

export interface Movie {
  id: number;
  title: string;
  release_date: string;
  runtime: number;
  vote_average: number;
  overview: string;
  genres: Genre[];
  belongs_to_collection: { name: string } | null;
  origin_country: string[];
  production_companies: ProductionCompany[];
  poster_path: string; 
}
