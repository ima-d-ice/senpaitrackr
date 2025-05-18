import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { addToLibrary, getAnimeFromLibrary } from '../utils/storage';
import { ThemeContext } from '../context/ThemeContext';

import { useContext } from 'react';



export default function AnimeDetails() {
  const { theme } = useContext(ThemeContext);
  const { id } = useParams();
  const [anime, setAnime] = useState(null);
  const [category, setCategory] = useState('');
  const [episodesWatched, setEpisodesWatched] = useState(0);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      setAnime(null);
      
      return;
    }

    setAnime(null);
    setCategory('');
    setEpisodesWatched(0);
    setRating(0);

    fetch(`https://api.jikan.moe/v4/anime/${numericId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`API request failed: ${res.status}`);
        }
        return res.json();
      })
      .then((apiData) => {
        if (apiData.data) {
          setAnime(apiData.data); 

        
          const animeInLibrary = getAnimeFromLibrary(numericId);
          if (animeInLibrary) {
            setCategory(animeInLibrary.watchType);
            setEpisodesWatched(animeInLibrary.userEpisodes);
            setRating(animeInLibrary.userRating);
          }
        
        } else {
          setAnime(null); 
        }
      })
      .catch(error => {
        console.error("Failed to fetch anime details:", error);
        setAnime(null);
      });

  }, [id]);


  useEffect(() => {
    
    if (category && anime && anime.mal_id) {
      addToLibrary(category, anime, rating, episodesWatched);
    }
  }, [category, anime, rating, episodesWatched]); 

  if (!anime) {
    return <div className="flex justify-center items-center min-h-screen dark:bg-gray-900 dark:text-white">Loading...</div>;
  }

  return (
    <div data-theme = {theme}>
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4 md:px-12">
      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 md:p-8">
        <div className="md:flex">
          <div className="md:w-1/3 mb-6 md:mb-0 md:mr-8">
            <img 
              src={anime.images?.jpg?.large_image_url || 'default_placeholder_image.png'} 
              alt={anime.title} 
              className="rounded-lg shadow-md w-full object-cover"
            />
          </div>
          <div className="md:w-2/3">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-800 dark:text-white">{anime.title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {anime.type} {anime.episodes ? `(${anime.episodes} episodes)` : ''} - Score: {anime.score || 'N/A'}
            </p>
            
            <div className="flex flex-wrap gap-4 items-center mb-6">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select Status</option>
                <option value="watching">Watching</option>
                <option value="completed">Completed</option>
                <option value="planToWatch">Plan to Watch</option>
                <option value="dropped">Dropped</option>
                <option value="onHold">On Hold</option>
              </select>

              {category && (
                <> 
                  <input
                    type="number"
                    value={episodesWatched}
                    onChange={(e) => setEpisodesWatched(Math.max(0, parseInt(e.target.value) || 0))}
                    min="0"
                    max={anime.episodes || undefined} 
                    placeholder="Ep. Watched"
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-md w-28 text-center focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="number"
                    value={rating}
                    onChange={(e) => setRating(Math.max(0, Math.min(10, parseFloat(e.target.value) || 0)))}
                    min="0"
                    max="10"
                    step="0.1"
                    placeholder="Rating (0-10)"
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-md w-28 text-center focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 dark:text-white"
                  />
                </>
              )}
            </div>
            
            <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">Synopsis</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4 whitespace-pre-wrap">
              {anime.synopsis || 'No synopsis available.'}
            </p>
            
          
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
