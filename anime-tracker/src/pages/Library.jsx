import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import AnimeList from '../components/AnimeList';
import FilterControls from '../components/FilterControls';

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
  const [value, setValue] = useState('all');
  const [library, setLibrary] = useState(getLibrary());
  const [filters, setFilters] = useState({ genre: '', year: '', format: '' });

  const rawAnimeList = getAnimeList(value, library);
  const animeList = Array.from(
    new Map(rawAnimeList.map(item => [item.id, item])).values()
  );

  const filteredAnimeList = animeList.filter(anime => {
    const matchesGenre = filters.genre ? anime.genre.includes(filters.genre) : true;
    const matchesYear = filters.year ? anime.year === filters.year : true;
    const matchesFormat = filters.format ? anime.format === filters.format : true;
    return matchesGenre && matchesYear && matchesFormat;
  });

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

  return (
    <div data-theme={theme} className="min-h-screen bg-amber-50 dark:bg-neutral-900 py-6">
      <div className="container mx-auto px-4">
        <div className="flex justify-center mb-8">
          <FilterControls filters={filters} setFilters={setFilters} />
        </div>

        {filteredAnimeList.length > 0 ? (
          <AnimeList animeList={filteredAnimeList} />
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
            <p className="text-xl">Your library is empty in this category.</p>
            <p>Add some anime to see them here!</p>
          </div>
        )}
      </div>
    </div>
  );
}

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

export default Library;