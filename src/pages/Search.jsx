import { useState, useMemo, useEffect } from "react";
import { debounce } from "lodash";
import AnimeCard from "../components/AnimeCard";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

const fetchAnimeSuggestions = async (query, setSuggestions) => {
  if (!query) {
    setSuggestions([]);
    return;
  }
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime?q=${query}&limit=5`);
    const data = await res.json();
    setSuggestions(data.data);
  } catch (err) {
    console.error("Fetch failed:", err);
  }
};

function Search() {
  const { theme } = useContext(ThemeContext);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const debouncedFetchSuggestions = useMemo(
    () =>
      debounce((query) => {
        fetchAnimeSuggestions(query, setSuggestions);
      }, 300),
    [setSuggestions]
  );

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedFetchSuggestions(value);
  };

  useEffect(() => {
    return () => {
      debouncedFetchSuggestions.cancel();
    };
  }, [debouncedFetchSuggestions]);

  async function handleSubmit(e) {
    setSuggestions([]);
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`https://api.jikan.moe/v4/anime?q=${query}`);
      const data = await res.json();
      setResults(data.data);
    } catch (err)      {
      console.error("Failed to fetch anime:", err);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4 md:px-12" data-theme={theme}>
      <div className="max-w-6xl mx-auto">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 mb-6">
          <input
            type="text"
            value={query}
            onChange={handleChange}
            placeholder="Search anime..."
            className="border border-gray-300 dark:border-gray-600 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-teal-400 dark:focus:ring-teal-500 bg-white dark:bg-gray-800 dark:text-white"
          />
          <button
            type="submit"
            className="bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700 text-white px-6 py-3 sm:py-2 rounded transition"
          >
            Search
          </button>
        </form>

        {suggestions.length > 0 && (
          <div className="bg-white dark:bg-gray-800 shadow-md p-4 rounded mb-6">
            <h3 className="font-semibold mb-2 text-gray-700 dark:text-gray-200">Suggestions:</h3>
            <ul>
              {suggestions.map((anime) => (
                <li
                  key={anime.mal_id}
                  className="py-1 cursor-pointer text-gray-600 hover:text-teal-600 dark:text-gray-300 dark:hover:text-teal-400"
                  onClick={() => {
                    setQuery(anime.title);
                    setSuggestions([]);
                    setResults([anime]); 
                  }}
                >
                  {anime.title}
                </li>
              ))}
            </ul>
          </div>
        )}

        {loading && <p className="text-center text-lg font-medium text-gray-700 dark:text-gray-300">Loading...</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from(
            new Map(results.map(item => [item.mal_id, item])).values()
          ).map((anime) => (
            <AnimeCard
              key={anime.mal_id}
              id={anime.mal_id}
              name={anime.title}
              src={anime.images.jpg.image_url}
              score={anime.score}
              episodes={anime.episodes}
              type={anime.type}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Search;
