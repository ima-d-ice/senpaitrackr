import React from 'react'
import { useState } from 'react'
import { useEffect } from 'react'
import { useContext } from 'react'
import { ThemeContext } from '../context/ThemeContext'

import AnimeList from '../components/AnimeList'
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
    const [value, setValue] = useState('all');
      const [library, setLibrary] = useState(getLibrary());
    
      const rawAnimeList = getAnimeList(value, library); // ✅ derived value
      const animeList = Array.from(
        new Map(rawAnimeList.map(item => [item.id, item])).values()
      );
    
     
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
        <div className="flex justify-center mb-6">
            <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 p-3 rounded-lg shadow-md focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 border border-gray-300 dark:border-gray-700"
            >
            <option value="all">All</option>
            <option value="watching">Watching</option>
            <option value="completed">Completed</option>
            <option value="onHold">On Hold</option>
            <option value="dropped">Dropped</option>
            <option value="planToWatch">Plan to Watch</option>
            </select>
        </div>
    
        {animeList.length > 0 ? (
          <AnimeList animeList={animeList} />
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

export default Library
