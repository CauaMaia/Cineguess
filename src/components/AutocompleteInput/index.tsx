import { useEffect, useState } from 'react';
import './styles.css';

interface Suggestion {
  id: number;
  title: string;
  poster_path: string | null;
}

interface AutocompleteInputProps {
  onSelect: (id: number) => void;
}

export default function AutocompleteInput({ onSelect }: AutocompleteInputProps) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
   const [, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);

  useEffect(() => {
    if (input.trim() === '') {
      setSuggestions([]);
      setNoResults(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=b99918f33e94c5d4c5bccc92e577de54&query=${encodeURIComponent(
            input
          )}`
        );
        const data = await res.json();
        if (data.results?.length) {
          setSuggestions(
              data.results.slice(0, 5).map((m: { id: number; title: string; poster_path: string | null }) => ({
                id: m.id,
                title: m.title,
                poster_path: m.poster_path,
              }))
          );
          setNoResults(false);
        } else {
          setSuggestions([]);
          setNoResults(true);
        }
        } catch {
          setSuggestions([]);
          setNoResults(true);
        } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [input]);

  const handleSelect = (id: number) => {
    onSelect(id);
    setInput('');
    setSuggestions([]);
    setNoResults(false);
  };

  return (
    <div className="autocomplete-container">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Digite o nome de um filme"
      />
      {(suggestions.length > 0 || noResults) && (
        <ul className="autocomplete-dropdown">
          {suggestions.map((s) => (
            <li key={s.id} onClick={() => handleSelect(s.id)}>
              {s.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w45${s.poster_path}`}
                  alt={`Poster de ${s.title}`}
                  className="suggestion-poster"
                />
              ) : (
                <div className="suggestion-poster placeholder" />
              )}
              <span className="suggestion-title">{s.title}</span>
            </li>
          ))}
          {noResults && <li className="no-result">Nenhum filme encontrado</li>}
        </ul>
      )}
    </div>
  );
}
