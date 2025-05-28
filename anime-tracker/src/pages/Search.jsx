import { useState, useMemo, useEffect, useContext, useRef } from "react"; 
import { debounce } from "lodash";
import AnimeCard from "../components/AnimeCard";
import AnimeList from "../components/AnimeList";
import FilterControls from "../components/FilterControls";
import { ThemeContext } from "../context/ThemeContext";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { fetchAnimeSuggestionsAPI, fetchSearchedAnime, fetchInitialAnimeList } from "../services/apiService";

function Search() {
  const { theme } = useContext(ThemeContext);
  const [inputValue, setInputValue] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ genre: "", year: "", format: "" });

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
    }
  };

  const {
    data: initialData,
    fetchNextPage: fetchNextInitialPage,
    hasNextPage: hasNextInitialPage,
    isFetchingNextPage: isFetchingNextInitialPage,
    isLoading: isLoadingInitial,
    error: initialError,
  } = useInfiniteQuery({
    queryKey: ["initialAnimeList"],
    queryFn: fetchInitialAnimeList,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination?.has_next_page) {
        return (lastPage.pagination.current_page || 0) + 1;
      }
      return undefined;
    },
    enabled: !searchQuery,
    staleTime: 1000 * 60 * 15,
  });

  const allFetchedAnime = useMemo(() => {
    return initialData?.pages.flatMap(page => page.data) || [];
  }, [initialData]);

  const initialAnimeToDisplay = useMemo(() => {
    const uniqueAnime = new Map();
    allFetchedAnime.forEach(anime => {
      if (anime && anime.mal_id) {
        if (!uniqueAnime.has(anime.mal_id)) {
          uniqueAnime.set(anime.mal_id, anime);
        }
      }
    });
    return Array.from(uniqueAnime.values());
  }, [allFetchedAnime]);

  const {
    data: searchResultsData,
    isLoading: isLoadingSearchResults,
    isFetching: isFetchingSearchResults,
    error: searchResultsError,
  } = useQuery({
    queryKey: ["animeSearch", searchQuery, currentPage, filters],
    queryFn: () => fetchSearchedAnime(searchQuery, currentPage, filters),
    enabled: !!searchQuery,
    staleTime: 1000 * 60 * 10,
    keepPreviousData: true,
  });

  const searchedAnimeToDisplay = searchResultsData?.data || [];
  const paginationInfo = searchResultsData?.pagination;

  const handleSubmit = (e) => {
    e.preventDefault();
    debouncedSetQuery.cancel();
    setDebouncedQuery("");
    setCurrentPage(1);
    setSearchQuery(inputValue);
  };

  const handleSuggestionClick = (anime) => {
    setInputValue(anime.title);
    debouncedSetQuery.cancel();
    setDebouncedQuery("");
    setCurrentPage(1);
    setSearchQuery(anime.title);
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
          <div className="flex items-center">
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

        <FilterControls filters={filters} setFilters={setFilters} />

        {isLoadingSearchResults && <p className="text-center text-lg font-medium text-gray-700 dark:text-gray-300">Loading search results...</p>}
        {searchResultsError && <p className="text-center text-red-500">Error fetching results: {searchResultsError.message}</p>}
        
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
      </div>
    </div>
  );
}

export default Search;