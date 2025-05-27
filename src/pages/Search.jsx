import { useState, useMemo, useEffect } from "react";
import { debounce } from "lodash";
import AnimeCard from "../components/AnimeCard";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { useQuery } from "@tanstack/react-query";

// API fetching functions
const fetchAnime = async (query, page = 1) => {
  if (!query) return { data: [], pagination: null }; // Return shape consistent with API response
  const res = await fetch(`https://api.jikan.moe/v4/anime?q=${query}&page=${page}&limit=12`); // Added limit for consistent page size
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  const responseData = await res.json();
  return {
    data: responseData.data || [],
    pagination: responseData.pagination || null,
  };
};

const fetchAnimeSuggestionsAPI = async (query) => {
  if (!query) return [];
  const res = await fetch(`https://api.jikan.moe/v4/anime?q=${query}&limit=5`);
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status} for suggestions`);
  }
  const data = await res.json();
  return data.data || [];
};

function Search() {
  const { theme } = useContext(ThemeContext);
  const [inputValue, setInputValue] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // State for current page

  const debouncedSetQuery = useMemo(
    () =>
      debounce((value) => {
        setDebouncedQuery(value);
      }, 300),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSetQuery.cancel();
    };
  }, [debouncedSetQuery]);

  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSetQuery(value);
    if (!value) { 
        setSearchQuery("");
        setCurrentPage(1); // Reset to page 1 on new search
    }
  };

  const {
    data: suggestions = [],
    isLoading: isLoadingSuggestions,
  } = useQuery({
    queryKey: ["animeSuggestions", debouncedQuery],
    queryFn: () => fetchAnimeSuggestionsAPI(debouncedQuery),
    enabled: !!debouncedQuery,
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: searchData, // Contains { data: results, pagination: paginationInfo }
    isLoading: isLoadingResults,
    isFetching: isFetchingResults,
    error: resultsError,
  } = useQuery({
    queryKey: ["animeSearch", searchQuery, currentPage], // Add currentPage to queryKey
    queryFn: () => fetchAnime(searchQuery, currentPage),
    enabled: !!searchQuery,
    staleTime: 1000 * 60 * 10,
    keepPreviousData: true, // Useful for smoother pagination
  });

  const results = searchData?.data || [];
  const paginationInfo = searchData?.pagination;

  const handleSubmit = (e) => {
    e.preventDefault();
    debouncedSetQuery.cancel(); // Explicitly cancel any pending debounced calls
    setDebouncedQuery("");      // Clear the debounced query state immediately
                                // This will disable the suggestions query if it hasn't fired
                                // or if it's in flight, React Query will handle it gracefully
                                // as the `enabled` flag becomes false.
    setCurrentPage(1);          // Reset to page 1 on new search
    setSearchQuery(inputValue); // Set the actual search query
  };

  const handleSuggestionClick = (anime) => {
    setInputValue(anime.title);
    setDebouncedQuery("");
    setCurrentPage(1); // Reset to page 1 on new search from suggestion
    setSearchQuery(anime.title);
  };
  
  const displayResults = searchQuery ? results : [];

  const handleNextPage = () => {
    if (paginationInfo?.has_next_page) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

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
              value={inputValue}
              onChange={handleChange}
              placeholder="Search anime..."
              className="flex-grow p-4 pl-5 bg-transparent text-gray-900 dark:text-white focus:outline-none placeholder-gray-500 dark:placeholder-gray-400 text-base"
            />
            <button
              type="submit"
              aria-label="Search"
              className="flex items-center justify-center p-4 bg-zinc-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 
                         text-gray-600 dark:text-gray-300 
                         rounded-r-full transition-colors duration-200
                         border-l border-gray-300 dark:border-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </button>
          </div>
        </form>

        {debouncedQuery && suggestions.length > 0 && !isLoadingSuggestions && (
          <div className="bg-white dark:bg-gray-800 shadow-md p-4 rounded mb-6">
            <h3 className="font-semibold mb-2 text-gray-700 dark:text-gray-200">Suggestions:</h3>
            <ul>
              {suggestions.map((anime) => (
                <li
                  key={anime.mal_id}
                  className="py-1 cursor-pointer text-gray-600 hover:text-teal-600 dark:text-gray-300 dark:hover:text-teal-400"
                  onClick={() => handleSuggestionClick(anime)}
                >
                  {anime.title}
                </li>
              ))}
            </ul>
          </div>
        )}
        {isLoadingSuggestions && debouncedQuery && <p className="text-center text-sm text-gray-500 dark:text-gray-400">Loading suggestions...</p>}

        {(isLoadingResults || isFetchingResults) && searchQuery && <p className="text-center text-lg font-medium text-gray-700 dark:text-gray-300">Loading...</p>}
        {resultsError && <p className="text-center text-red-500">Error fetching results: {resultsError.message}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-4 justify-items-center">
          {Array.from(
            new Map(displayResults.map(item => [item.mal_id, item])).values()
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
        {!isLoadingResults && !isFetchingResults && searchQuery && displayResults.length === 0 && (
            <p className="text-center text-lg font-medium text-gray-700 dark:text-gray-300">No results found for "{searchQuery}".</p>
        )}

        {/* Pagination Controls */}
        {searchQuery && results.length > 0 && paginationInfo && (
          <div className="flex justify-center items-center space-x-4 my-8">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1 || isLoadingResults || isFetchingResults}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-md disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors"
            >
              Previous
            </button>
            <span className="text-gray-700 dark:text-gray-300">
              Page {paginationInfo.current_page || currentPage} 
              {paginationInfo.last_visible_page && ` of ${paginationInfo.last_visible_page}`}
            </span>
            <button
              onClick={handleNextPage}
              disabled={!paginationInfo?.has_next_page || isLoadingResults || isFetchingResults}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-md disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;
