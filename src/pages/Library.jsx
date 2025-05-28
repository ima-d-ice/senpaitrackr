import React, { useState, useEffect, useContext, useMemo } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import Filter from '../components/Filter'; // Import Filter component
import AnimeList from '../components/AnimeList';

const getAnimeList = (value, library) => {
  switch (value) {
    case 'watching':
      return library.watching;
    case 'completed':
      return library.completed;
    case 'onHold':
      return library.onHold;
    case 'dropped':
      return library.dropped;
    case 'planToWatch':
      return library.planToWatch;
    default:
      return [
        ...library.watching,
        ...library.completed,
        ...library.onHold,
        ...library.dropped,
        ...library.planToWatch,
      ];
  }
};

const getLibrary = () =>
  JSON.parse(localStorage.getItem('animeLibrary')) || {
    watching: [],
    completed: [],
    onHold: [],
    dropped: [],
    planToWatch: [],
  };

function Library() {
    const { theme } = useContext(ThemeContext);
    const [value, setValue] = useState('all'); // For category filter
    const [library, setLibrary] = useState(getLibrary());
    const [activeFilters, setActiveFilters] = useState({
        genre: "",
        year: "",
        type: "",
    });

    const handleFilterChange = (newFilters) => {
        setActiveFilters(newFilters);
    };
    
    useEffect(() => {
        const handleLibraryUpdate = () => {
          const updatedLibrary = getLibrary();
          setLibrary(updatedLibrary);
        };
    
        window.addEventListener('libraryUpdated', handleLibraryUpdate);
        return () => {
          window.removeEventListener('libraryUpdated', handleLibraryUpdate);
        };
      }, []);

    const rawAnimeListForCategory = getAnimeList(value, library);

    const finalAnimeList = useMemo(() => {
        let list = Array.from(
            new Map(rawAnimeListForCategory.map(item => [item.id || item.mal_id, item])).values()
        );

        if (activeFilters.genre) {
            list = list.filter(anime =>
                anime.genres && anime.genres.some(genreName => 
                    genreName && genreName.toLowerCase() === activeFilters.genre.toLowerCase()
                )
            );
        }
        if (activeFilters.year) {
            list = list.filter(anime => {
                const animeYear = anime.year || (anime.aired && new Date(anime.aired.from).getFullYear());
                return animeYear === parseInt(activeFilters.year);
            });
        }
        if (activeFilters.type) {
            list = list.filter(anime => anime.type === activeFilters.type);
        }
        return list;
    }, [rawAnimeListForCategory, activeFilters]);
    
  return (
    <div data-theme={theme} className="min-h-screen bg-amber-50 dark:bg-neutral-900 py-6">
      <div className="container mx-auto px-4">
        <div className="flex justify-center mb-8">
          <div className="relative inline-block">
            <select
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="appearance-none w-64 bg-white dark:bg-gray-700 
                         text-gray-800 dark:text-gray-100 
                         py-3 px-5 pr-10  /* Increased padding, pr for arrow space */
                         rounded-lg shadow-lg 
                         border border-gray-300 dark:border-gray-600 
                         focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400
                         focus:border-teal-500 dark:focus:border-teal-400
                         transition-all duration-150 ease-in-out
                         hover:border-gray-400 dark:hover:border-gray-500"
            >
              <option value="all">All Categories</option>
              <option value="watching">Currently Watching</option>
              <option value="completed">Completed</option>
              <option value="onHold">On Hold</option>
              <option value="dropped">Dropped</option>
              <option value="planToWatch">Plan to Watch</option>
            </select>
            {/* Custom Arrow */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700 dark:text-gray-200">
              <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        <Filter onFilterChange={handleFilterChange} />
    
        {finalAnimeList.length > 0 ? (
          <AnimeList animeList={finalAnimeList} />
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
            <p className="text-xl">Your library is empty in this category.</p>
            <p>Add some anime to see them here!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Library;
