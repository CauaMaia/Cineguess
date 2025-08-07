import { Movie } from '../types/movie';

const API_KEY = 'b99918f33e94c5d4c5bccc92e577de54';
const BASE_URL = 'https://api.themoviedb.org/3';


export async function fetchMovieById(id: number): Promise<Movie | null> {
  try {
    const response = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}`);
    if (!response.ok) throw new Error('Erro ao buscar por ID');
    return await response.json();
  } catch (error) {
    console.error('fetchMovieById error:', error);
    return null;
  }
}

export async function searchMovieByTitle(title: string): Promise<Movie | null> {
  try {
    const response = await fetch(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(title)}`
    );
    const data = await response.json();
    const movie = data.results?.[0];
    if (!movie) return null;

    // Busca os detalhes completos do filme
    return await fetchMovieById(movie.id);
  } catch (error) {
    console.error('searchMovieByTitle error:', error);
    return null;
  }
}

export async function suggestClosestMovie(input: string): Promise<string> {
  try {
    const response = await fetch(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(input)}`
    );
    const data = await response.json();
    const movie = data.results?.[0];
    return movie?.title || 'nenhum filme';
  } catch {
    return 'nenhum filme';
  }
}


export async function fetchPopularMovieIds(): Promise<number[]> {
  try {
    const page = Math.floor(Math.random() * 5) + 1; 

    const res = await fetch(
      `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=pt-BR&sort_by=popularity.desc&vote_count.gte=1000&page=${page}`
    );
    const data = await res.json();
    return data.results?.map((m: { id: number }) => m.id) || [];
  } catch (err) {
    console.error('Erro ao buscar filmes populares:', err);
    return [986056]; // fallback para Thunderbolts
  }
}

