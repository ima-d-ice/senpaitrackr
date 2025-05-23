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
    <div className="min-h-screen bg-amber-50 dark:bg-neutral-900 py-8 px-4 md:px-12" data-theme={theme}>
      <div className="max-w-6xl mx-auto">
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex items-center bg-zinc-300 dark:bg-gray-800 
                          rounded-full shadow-lg hover:shadow-xl focus-within:shadow-xl 
                          transition-all duration-300 ease-in-out 
                          focus-within:ring-2 focus-within:ring-teal-500 dark:focus-within:ring-teal-400 
                          focus-within:ring-offset-2 focus-within:ring-offset-amber-50 dark:focus-within:ring-offset-neutral-900">
            
            <input
              type="text"
              value={query}
              onChange={handleChange}
              placeholder="Search anime..."
              className="flex-grow p-4 pl-5 bg-transparent text-gray-900 dark:text-white focus:outline-none placeholder-gray-500 dark:placeholder-gray-400 text-base"
            />
            {/* Visually distinct search button part */}
            <button
              type="submit"
              aria-label="Search" // Added aria-label for accessibility
              className="flex items-center justify-center p-4 bg-zinc-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 
                         text-gray-600 dark:text-gray-300 
                         rounded-r-full transition-colors duration-200
                         border-l border-gray-300 dark:border-gray-600" // Separator line
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </button>
          </div>
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

        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-4 justify-items-center">
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
