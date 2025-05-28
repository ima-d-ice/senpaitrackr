import { useState, useMemo, useEffect, useContext, useRef } from "react"; 
import { debounce } from "lodash";
import AnimeCard from "../components/AnimeCard";
import { ThemeContext } from "../context/ThemeContext";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import Filter from "../components/Filter"; // Import Filter

// Placeholder for genre name to ID mapping function
// You'll need to implement this, e.g., by fetching from /genres/anime or a static map
const genreNameToIdMap = {
    "Action": 1,
    "Adventure": 2,
    "Comedy": 4,
    "Drama": 8,
    "Fantasy": 10,
    "Horror": 14,
    "Mahou Shoujo": 16,
    "Mecha": 18,
    "Music": 19,
    "Mystery": 7,
    "Psychological": 40,
    "Romance": 22,
    "Sci-Fi": 24,
    "Slice of Life": 36,
    "Sports": 30,
    "Supernatural": 37,
    "Thriller": 41,
    "Ecchi": 9,
    // Add other genres as needed
};

const getGenreIdByName = (genreName) => {
    return genreNameToIdMap[genreName] || null;
};


// API fetching function for initial list (now using /anime for better filtering)
const fetchInitialAnimeList = async ({ pageParam = 1, queryKey }) => {
  const [_key, filters] = queryKey; // Extract filters from queryKey
  // Use /anime endpoint for comprehensive filtering
  // Added order_by=popularity&sort=desc for a sensible default when no search query
  let apiUrl = `https://api.jikan.moe/v4/anime?page=${pageParam}&limit=12&sfw=true&order_by=popularity&sort=desc`;

  if (filters) {
    if (filters.type) {
      apiUrl += `&type=${filters.type.toLowerCase()}`;
    }
    if (filters.year) {
      apiUrl += `&year=${filters.year}`;
    }
    if (filters.genre) {
      const genreId = getGenreIdByName(filters.genre);
      if (genreId) {
        apiUrl += `&genres=${genreId}`;
      }
    }
    // If you add status or other filters to your Filter component, include them here.
    // e.g., if (filters.status) apiUrl += `&status=${filters.status}`;
  }

  const res = await fetch(apiUrl);
  if (!res.ok) {
    // Consider more specific error messages or logging apiUrl for debugging
    throw new Error(`HTTP error! status: ${res.status} for initial list. URL: ${apiUrl}`);
  }
  const responseData = await res.json();
  return {
    data: responseData.data || [],
    pagination: responseData.pagination || null,
  };
};

// API fetching function for search results (paginated)
const fetchSearchedAnime = async (query, page = 1, filters) => {
  if (!query) return { data: [], pagination: null };
  // Added order_by=score&sort=desc for search results, adjust as needed
  let apiUrl = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&page=${page}&limit=12&sfw=true&order_by=score&sort=desc`;
  if (filters) {
    if (filters.type) {
      apiUrl += `&type=${filters.type.toLowerCase()}`;
    }
    if (filters.year) {
      apiUrl += `&year=${filters.year}`;
    }
    if (filters.genre) {
      const genreId = getGenreIdByName(filters.genre);
      if (genreId) {
        apiUrl += `&genres=${genreId}`;
      }
    }
    // If you add status or other filters to your Filter component, include them here.
  }
  const res = await fetch(apiUrl);
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status} for search. URL: ${apiUrl}`);
  }
  const responseData = await res.json();
  return {
    data: responseData.data || [],
    pagination: responseData.pagination || null,
  };
};

// API fetching function for suggestions
const fetchAnimeSuggestionsAPI = async (query) => {
  if (!query) return [];
  const res = await fetch(`https://api.jikan.moe/v4/anime?q=${query}&limit=5&sfw=true`);
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
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState({ genre: "", year: "", type: "" });

  const loadMoreRef = useRef(null);

  const debouncedSetQuery = useMemo(
    () => debounce((value) => setDebouncedQuery(value), 300),
    []
  );

  useEffect(() => {
    return () => debouncedSetQuery.cancel();
  }, [debouncedSetQuery]);

  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSetQuery(value);
    if (!value) {
      setSearchQuery(""); // Clear search query to show initial list
      setCurrentPage(1);
      // No need to reset debouncedQuery here, suggestions will hide if input is empty
    }
  };

  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);
    setCurrentPage(1); // Reset page when filters change
  };

  // --- Infinite Scroll for Initial Load ---
  const {
    data: initialData,
    fetchNextPage: fetchNextInitialPage,
    hasNextPage: hasNextInitialPage,
    isFetchingNextPage: isFetchingNextInitialPage,
    isLoading: isLoadingInitial,
    error: initialError,
  } = useInfiniteQuery({
    queryKey: ["initialAnimeList", activeFilters], // Include activeFilters in queryKey
    queryFn: fetchInitialAnimeList,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination?.has_next_page) {
        return (lastPage.pagination.current_page || 0) + 1;
      }
      return undefined;
    },
    enabled: !searchQuery, // Active when no search query
    staleTime: 1000 * 60 * 15, // Cache initial list longer
  });
  
  const allFetchedAnime = useMemo(() => {
    return initialData?.pages.flatMap(page => page.data) || [];
  }, [initialData]);

  // Client-side filtering for genre/year on initial list is no longer needed
  // as the API call in fetchInitialAnimeList now handles these filters.
  // const clientFilteredInitialAnime = useMemo(() => { ... }); // REMOVE THIS BLOCK

  // Memoized and de-duplicated list for display (de-duplication can still be useful for infinite scroll)
  const initialAnimeToDisplay = useMemo(() => {
    const uniqueAnime = new Map();
    allFetchedAnime.forEach(anime => { // allFetchedAnime is now API-filtered
      if (anime && anime.mal_id) { 
        if (!uniqueAnime.has(anime.mal_id)) {
          uniqueAnime.set(anime.mal_id, anime);
        }
      }
    });
    return Array.from(uniqueAnime.values());
  }, [allFetchedAnime]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || searchQuery) return; // Don't observe if ref not set or if searching

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextInitialPage && !isFetchingNextInitialPage) {
          fetchNextInitialPage();
        }
      },
      { threshold: 1.0 } // Trigger when 100% of the element is visible
    );

    const currentLoadMoreRef = loadMoreRef.current; // Capture the current value
    if (currentLoadMoreRef) {
      observer.observe(currentLoadMoreRef);
    }

    return () => {
      if (currentLoadMoreRef) { // Use the captured value in cleanup
        observer.unobserve(currentLoadMoreRef);
      }
    };
  }, [hasNextInitialPage, isFetchingNextInitialPage, fetchNextInitialPage, searchQuery, initialAnimeToDisplay]); // Re-run if these change


  // --- Paginated Search Results ---
  const {
    data: searchResultsData,
    isLoading: isLoadingSearchResults,
    isFetching: isFetchingSearchResults,
    error: searchResultsError,
  } = useQuery({
    queryKey: ["animeSearch", searchQuery, currentPage, activeFilters], // Include activeFilters
    queryFn: () => fetchSearchedAnime(searchQuery, currentPage, activeFilters), // Pass activeFilters
    enabled: !!searchQuery, // Active when there IS a search query
    staleTime: 1000 * 60 * 10,
    keepPreviousData: true,
  });
  const clientFilteredSearchedAnime = useMemo(() => {
    return searchResultsData?.data || []; // Directly use API response
  }, [searchResultsData]); // REMOVE THIS OR SIMPLIFY AS SHOWN
  
  const searchedAnimeToDisplay = searchResultsData?.data || []; // Directly use API filtered data
  const paginationInfo = searchResultsData?.pagination;

  // --- Suggestions ---
  const {
    data: suggestions = [],
    isLoading: isLoadingSuggestions,
    error: suggestionsError, // Add error state
  } = useQuery({
    queryKey: ["animeSuggestions", debouncedQuery],
    queryFn: () => fetchAnimeSuggestionsAPI(debouncedQuery),
    enabled: !!debouncedQuery && !!inputValue, // Only show if actively typing
    staleTime: 1000 * 60 * 5,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    debouncedSetQuery.cancel();
    setDebouncedQuery(""); // Clear debounced for suggestions
    setCurrentPage(1);
    setSearchQuery(inputValue); // This triggers the search view
  };

  const handleSuggestionClick = (anime) => {
    setInputValue(anime.title);
    debouncedSetQuery.cancel();
    setDebouncedQuery("");
    setCurrentPage(1);
    setSearchQuery(anime.title); // This triggers the search view
  };

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

        <Filter onFilterChange={handleFilterChange} /> {/* Add Filter component */}

        {suggestionsError && ( // Display suggestion error
          <p className="text-center text-sm text-red-500 mb-4">Error loading suggestions. Please try again.</p>
        )}
        {debouncedQuery && inputValue && suggestions.length > 0 && !isLoadingSuggestions && !suggestionsError && (
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
        {isLoadingSuggestions && debouncedQuery && inputValue && <p className="text-center text-sm text-gray-500 dark:text-gray-400">Loading suggestions...</p>}

        {!searchQuery ? (
          // --- Initial Load / Infinite Scroll View ---
          <>
            {isLoadingInitial && initialAnimeToDisplay.length === 0 && <p className="text-center text-lg font-medium text-gray-700 dark:text-gray-300">Loading anime...</p>}
            {initialError && <p className="text-center text-red-500">Error loading anime: {initialError.message}</p>}
            {!isLoadingInitial && !initialError && initialAnimeToDisplay.length === 0 && !activeFilters.genre && !activeFilters.year && !activeFilters.type && (
              <p className="text-center text-lg font-medium text-gray-700 dark:text-gray-300">No anime found.</p>
            )}
             {!isLoadingInitial && !initialError && initialAnimeToDisplay.length === 0 && (activeFilters.genre || activeFilters.year || activeFilters.type) && (
              <p className="text-center text-lg font-medium text-gray-700 dark:text-gray-300">No anime match the current filters.</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-4 justify-items-center">
              {initialAnimeToDisplay.map((anime) => (
                <AnimeCard
                  key={`${anime.mal_id}-initial`}
                  id={anime.mal_id}
                  name={anime.title}
                  src={anime.images?.jpg?.image_url}
                  score={anime.score}
                  episodes={anime.episodes}
                  type={anime.type}
                year={anime.year}
                genres={anime.genres}
                />
              ))}
            </div>
            {/* Element to observe for infinite scroll */}
            <div ref={loadMoreRef} style={{ height: "1px" }}></div> 

            {isFetchingNextInitialPage && (
              <p className="text-center text-gray-500 dark:text-gray-400 my-8">Loading more...</p>
            )}
            {!isFetchingNextInitialPage && !hasNextInitialPage && initialAnimeToDisplay.length > 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 my-8">You've seen it all!</p>
            )}
            {/* Fallback button, can be removed if infinite scroll is preferred solely */}
            {hasNextInitialPage && !isFetchingNextInitialPage && (
                 <div className="flex justify-center my-8">
                    <button
                        onClick={() => fetchNextInitialPage()}
                        className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-md transition-colors"
                    >
                        Load More Anime (Fallback)
                    </button>
                </div>
            )}
          </>
        ) : (
          // --- Search Results View ---
          <>
            {(isLoadingSearchResults || isFetchingSearchResults) && <p className="text-center text-lg font-medium text-gray-700 dark:text-gray-300">Loading search results...</p>}
            {searchResultsError && <p className="text-center text-red-500">Error fetching results: {searchResultsError.message}</p>}
            
            {!isLoadingSearchResults && !isFetchingSearchResults && searchedAnimeToDisplay.length === 0 && !searchResultsError && (
              <p className="text-center text-lg font-medium text-gray-700 dark:text-gray-300">No results found for "{searchQuery}" with the current filters.</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-4 justify-items-center">
              {searchedAnimeToDisplay.map((anime) => (
                 <AnimeCard
                    key={`${anime.mal_id}-search`}
                    id={anime.mal_id}
                    name={anime.title}
                    src={anime.images?.jpg?.image_url}
                    score={anime.score}
                    episodes={anime.episodes}
                    type={anime.type}
                    year={anime.year}
                    genres={anime.genres}
                />
              ))}
            </div>
            {searchedAnimeToDisplay.length > 0 && paginationInfo && (
              <div className="flex justify-center items-center space-x-4 my-8">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1 || isLoadingSearchResults || isFetchingSearchResults}
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
                  disabled={!paginationInfo?.has_next_page || isLoadingSearchResults || isFetchingSearchResults}
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-md disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Search;
