import { useEffect, useState } from 'react';
import { Movie } from '../types/movie';
import { compareMovies } from '../utils/compareMovies';
import {
  fetchMovieById,
  fetchPopularMovieIds
} from '../services/movieService';

interface Feedback {
  field: string;
  value: string | number;
  result: 'correct' | 'partial' | 'higher' | 'lower' | 'wrong';
}

interface Guess {
  movie: Movie;
  feedbacks: Feedback[];
}

export function useCineguessGame() {
  const [answer, setAnswer] = useState<Movie | null>(null);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [isWinner, setIsWinner] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<number[]>([]); // para evitar repetições
  const [hints, setHints] = useState<string[]>([]);


  const devMode = false;
  


  useEffect(() => {
    loadRandomPopularMovie();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadRandomPopularMovie() {
    const popularIds = await fetchPopularMovieIds();
    let idToUse: number | null = null;

    for (let i = 0; i < 10; i++) {
      const candidate = popularIds[Math.floor(Math.random() * popularIds.length)];
      if (!history.includes(candidate)) {
        idToUse = candidate;
        break;
      }
    }

    if (!idToUse) idToUse = popularIds[0]; 

    const movie = await fetchMovieById(idToUse);
    if (movie) {
      setAnswer(movie);
      setHistory((prev) => [...prev.slice(-5), movie.id]);
      setGuesses([]);
      setIsWinner(false);
      setError(null);
      setHints([]);
    }
  }

  async function guessMovie(id: number) {
    if (!answer) return;
    setError(null);

    const alreadyTried = guesses.some((g) => g.movie.id === id);
    if (alreadyTried) {
      setError('⚠️ Você já tentou esse filme!');
      return;
    }

    const movie = await fetchMovieById(id);
    if (!movie) {
      setError('❓ Nenhum resultado encontrado.');
      return;
    }

    const feedbacks = compareMovies(movie, answer);
    const isCorrect = movie.id === answer.id;

    setGuesses((prev) => [...prev, { movie, feedbacks }]);
    if (isCorrect) {
      setIsWinner(true);
    }
  }

  useEffect(() => {
    if (!answer) return;
    const mistakes = guesses.filter((g) => g.movie.id !== answer.id).length;

    if (mistakes >= 7 && !hints[0]) {
      const studio = answer.production_companies[0]?.name;
      if (studio) setHints((prev) => [...prev, `Estúdio: ${studio}`]);
    }
    if (mistakes >= 10 && hints.length < 2) {
      const genreNames = answer.genres.map((g) => g.name).join(', ');
      if (genreNames) setHints((prev) => [...prev, `Gêneros: ${genreNames}`]);
    }
    if (mistakes >= 14 && hints.length < 3) {
      if (answer.overview)
        setHints((prev) => [...prev, `Descrição: ${answer.overview}`]);
    }
  }, [guesses, answer, hints]);

  function resetGame() {
    loadRandomPopularMovie();
  }


  return {
    answer,
    guesses,
    isWinner,
    guessMovie,
    resetGame,
    error,
    devMode,
    hints,
  };
}
