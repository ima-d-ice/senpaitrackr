import React, { useState, useEffect } from 'react';
import AnimeCard from '../components/AnimeCard';
import { Link } from "react-router-dom";
const CACHE_DURATION = 1000 * 60 * 60; 
import {
  deduplicateAnime,
  fetchTopAnime,
  fetchCurrentAnime,
  fetchUpcomingAnime
} from '../utils/api';
import { getLibrary } from '../utils/storage'; 
import { ThemeContext } from '../context/ThemeContext';

import { useContext } from 'react';
import bgVideo from '../assets/bg.mp4'; // Import the video


function Home() {
  const {theme} = useContext(ThemeContext);
  
  const [topAnime, setTopAnime] = useState([]);
  const [currentAnime, setCurrentAnime] = useState([]);
  const [upcomingAnime, setUpcomingAnime] = useState([]);
  const [randomRec, setRandomRec] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      const now = Date.now();

      const getAndCache = async (key, timestampKey, fetchFn, setFn) => {
        const cached = localStorage.getItem(key);
        const ts = localStorage.getItem(timestampKey);
        let data;
        if (cached && ts && now - +ts < CACHE_DURATION) {
          data = deduplicateAnime(JSON.parse(cached));
        } else {
          data = deduplicateAnime(await fetchFn());
          localStorage.setItem(key, JSON.stringify(data));
          localStorage.setItem(timestampKey, now.toString());
        }
        setFn(data);
        return data;
      };

      const topData = await getAndCache('topAnime', 'topAnimeTimestamp', fetchTopAnime, setTopAnime);
      await getAndCache('currentAnime', 'currentAnimeTimestamp', fetchCurrentAnime, setCurrentAnime);
      await getAndCache('upcomingAnime', 'upcomingAnimeTimestamp', fetchUpcomingAnime, setUpcomingAnime);

      const library = getLibrary();
      const libraryAnimeIds = Object.values(library).flat().map(anime => anime.id);

      const filteredTopData = topData.filter(anime => !libraryAnimeIds.includes(anime.mal_id));

      if (filteredTopData.length) {
        const rand = filteredTopData[Math.floor(Math.random() * filteredTopData.length)];
        setRandomRec(rand);
      } else if (topData.length) {
        // Fallback to any top anime if all are in library (though unlikely for "top" list)
        const rand = topData[Math.floor(Math.random() * topData.length)];
        setRandomRec(rand);
      }

     
    };

    fetchData();
  }, []);

  return (
    <div data-theme = {theme}>
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 dark:from-teal-950 dark:via-neutral-950 dark:to-emerald-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
     
      <section className="relative text-center py-20 sm:py-32 px-4 bg-amber-50 dark:bg-neutral-900 overflow-hidden">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute z-0 w-full h-full top-0 left-0 object-cover"
        >
          <source src={bgVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        <div className="relative z-10 max-w-3xl mx-auto ">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-teal-950 to-emerald-800 ">
            Welcome to senpaiTraCkr
          </h1>
          <p className="mb-8 text-lg sm:text-xl max-w-xl  mt-5 mx-auto text-transparent bg-clip-text bg-gradient-to-r from-teal-950 to-emerald-800 ">
            Your personal dashboard to track, discover, and enjoy anime.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
            <Link 
              to="/search" 
              className="w-full sm:w-auto px-8 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-900 hover:from-teal-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
            >
              Search Anime
            </Link>
            <Link 
              to="/library" 
              className="w-full sm:w-auto px-8 py-3 rounded-lg font-semibold border-teal-500 bg-teal-900 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
            >
              My Library
            </Link>
          </div>
        </div>
      </section>

      <div className=" mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {randomRec && (
          <div className="max-w-7xl mb-16 p-6 bg-gradient-to-br from-green-200 via-teal-100 to-emerald-100 dark:from-neutral-800 dark:via-teal-900 dark:to-emerald-950 shadow-lg rounded-xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-emerald-800 dark:text-green-200 text-center sm:text-left">Random Pick for You</h2>
            <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-6">
              <div className="flex-shrink-0 w-full sm:w-10/12 md:w-1/3 lg:w-1/4">
                <img 
                  src={randomRec.images.jpg.image_url} 
                  alt={randomRec.title} 
                  className="rounded-lg shadow-md w-full h-auto object-cover"
                />
              </div>
              <div className="w-full sm:w-10/12 md:w-auto md:ml-6 mt-4 md:mt-0 text-center md:text-left flex-grow">
                <h3 className="text-2xl font-semibold text-emerald-700 dark:text-green-300 mb-2">{randomRec.title}</h3>
                <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Score:</span> {randomRec.score || 'N/A'} | <span className="font-medium">Episodes:</span> {randomRec.episodes || 'N/A'} | <span className="font-medium">Type:</span> {randomRec.type || 'N/A'} | <span className="font-medium">Year:</span> {randomRec.year || 'N/A'}
                </div>
                {randomRec.genres && randomRec.genres.length > 0 && (
                  <div className="mb-3">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Genres: </span>
                    {randomRec.genres.map(genre => genre.name).join(', ')}
                  </div>
                )}
                <p className="text-gray-700 dark:text-gray-300 hidden md:block md:text-base lg:text-lg"> 
                  {randomRec.synopsis ? randomRec.synopsis : 'No synopsis available.'}
                </p>
              </div>
            </div>
          </div>
        )}

        <section className="mb-16">
          <h2 className="h-home">🔥 Top Anime</h2>
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 justify-items-center">
            {topAnime.map(anime => (
              <AnimeCard
                key={anime.mal_id}
                id={anime.mal_id}
                name={anime.title}
                src={anime.images.jpg.image_url}
                score={anime.score}
                episodes={anime.episodes}
                type={anime.type}
                year={anime.year}
                genres={anime.genres}

              />
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="h-home">📺 Currently Airing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 justify-items-center">
            {currentAnime.map(anime => (
              <AnimeCard
                key={anime.mal_id}
                id={anime.mal_id}
                name={anime.title}
                src={anime.images.jpg.image_url}
                score={anime.score}
                episodes={anime.episodes}
                type={anime.type}
                year={anime.year}
                genres={anime.genres}
              />
            ))}
          </div>
        </section>

        <section className="mb-12"> 
          <h2 className="h-home">📅 Upcoming Anime</h2>
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 justify-items-center">
            {upcomingAnime.map(anime => (
              <AnimeCard
                key={anime.mal_id}
                id={anime.mal_id}
                name={anime.title}
                src={anime.images.jpg.image_url}
                score={anime.score}
                episodes={anime.episodes}
                type={anime.type}
                year={anime.year}
                genres={anime.genres}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  </div>
    
  );
}

export default Home;

