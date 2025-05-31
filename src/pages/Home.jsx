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
    <div className="min-h-screen bg-gradient-to-br from-green-90 to-teal-150 dark:from-neutral-900 dark:to-teal-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
     
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

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {randomRec && (
          <div className="mb-16 p-6 bg-zinc-300 dark:bg-zinc-800 shadow-lg rounded-xl">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white text-center sm:text-left">🎲 Random Pick for You</h2>
            <div className="flex justify-center">
              <AnimeCard
                id={randomRec.mal_id}
                name={randomRec.title}
                src={randomRec.images.jpg.image_url}
                score={randomRec.score}
                episodes={randomRec.episodes}
                type={randomRec.type}
                year = {randomRec.year}
                genres={randomRec.genres}



              />
            </div>
          </div>
        )}

        <section className="mb-16">
          <h2 className="h-home">🔥 Top Anime</h2>
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
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
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
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
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
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

