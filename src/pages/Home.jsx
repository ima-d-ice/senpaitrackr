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


function Home() {
  const {theme} = useContext(ThemeContext);
  
  const [topAnime, setTopAnime] = useState([]);
  const [currentAnime, setCurrentAnime] = useState([]);
  const [upcomingAnime, setUpcomingAnime] = useState([]);
  const [randomRec, setRandomRec] = useState(null);
  const [randomQuote, setRandomQuote] = useState("");

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

      const animeQuotes = [
        "Power comes in response to a need, not a desire. — Goku",
        "Fear is not evil. It tells you what your weakness is. — Gildarts Clive",
        "A lesson without pain is meaningless. — Edward Elric",
        "In our society, letting others find out that you're a nice guy is a very risky move. — Hitagi Senjougahara",
        "Hard work is worthless for those that don’t believe in themselves. — Naruto Uzumaki"
      ];
      setRandomQuote(animeQuotes[Math.floor(Math.random() * animeQuotes.length)]);
    };

    fetchData();
  }, []);

  return (
    <div data-theme = {theme}>
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-slate-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
     
      <section className="relative text-center py-24 sm:py-32 px-4 bg-white dark:bg-slate-900 overflow-hidden">
        
        
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600 dark:from-teal-400 dark:to-blue-500">
            Welcome to senpaiTraCkr
          </h1>
          <p className="mb-8 text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
            Your personal dashboard to track, discover, and enjoy anime.
          </p>
          {randomQuote && (
            <blockquote className="mb-10 italic text-sm text-gray-500 dark:text-gray-400 border-l-4 border-teal-500 dark:border-teal-400 pl-4 py-2 inline-block">
              "{randomQuote}"
            </blockquote>
          )}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
            <Link 
              to="/search" 
              className="w-full sm:w-auto px-8 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 dark:from-teal-600 dark:to-blue-700 dark:hover:from-teal-500 dark:hover:to-blue-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
            >
              Search Anime
            </Link>
            <Link 
              to="/library" 
              className="w-full sm:w-auto px-8 py-3 rounded-lg font-semibold text-teal-600 dark:text-teal-400 bg-transparent border-2 border-teal-500 dark:border-teal-400 hover:bg-teal-500 hover:text-white dark:hover:bg-teal-400 dark:hover:text-slate-900 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
            >
              My Library
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {randomRec && (
          <div className="mb-16 p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white text-center sm:text-left">🎲 Random Pick for You</h2>
            <div className="flex justify-center">
              <AnimeCard
                id={randomRec.mal_id}
                name={randomRec.title}
                src={randomRec.images.jpg.image_url}
                score={randomRec.score}
                episodes={randomRec.episodes}
                type={randomRec.type}
              />
            </div>
          </div>
        )}

        <section className="mb-16">
          <h2 className="text-4xl font-bold mb-8 text-center text-blue-700 dark:text-blue-400">🔥 Top Anime</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {topAnime.map(anime => (
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
        </section>

        <section className="mb-16">
          <h2 className="text-4xl font-bold mb-8 text-center text-green-700 dark:text-green-400">📺 Currently Airing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {currentAnime.map(anime => (
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
        </section>

        <section className="mb-12"> 
          <h2 className="text-4xl font-bold mb-8 text-center text-indigo-700 dark:text-indigo-400">📅 Upcoming Anime</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {upcomingAnime.map(anime => (
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
        </section>
      </div>
    </div>
  </div>
    
  );
}

export default Home;

