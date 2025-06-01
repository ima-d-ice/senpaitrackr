import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
// Import Firestore functions
import { addToLibraryFirestore, getAnimeFromFirestore } from '../utils/firebaseLibrary';
import { ThemeContext } from '../context/ThemeContext';
import { auth } from '../config/firebase'; // Import auth to check currentUser

export default function AnimeDetails() {
  const { theme } = useContext(ThemeContext);
  const { id } = useParams();
  const [anime, setAnime] = useState(null);
  const [category, setCategory] = useState('');
  const [episodesWatched, setEpisodesWatched] = useState(0);
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      setError("Invalid Anime ID.");
      setLoading(false);
      setAnime(null);
      return;
    }

    setLoading(true);
    setError(null);
    setAnime(null); // Reset anime state
    setCategory('');
    setEpisodesWatched(0);
    setRating(0);

    const fetchAnimeData = async () => {
      try {
        const apiRes = await fetch(`https://api.jikan.moe/v4/anime/${numericId}`);
        if (!apiRes.ok) {
          throw new Error(`API request failed: ${apiRes.status}`);
        }
        const apiData = await apiRes.json();

        if (apiData.data) {
          setAnime(apiData.data);

          // Fetch library status from Firestore if user is logged in
          if (auth.currentUser) {
            const animeInLibrary = await getAnimeFromFirestore(numericId);
            if (animeInLibrary) {
              setCategory(animeInLibrary.watchType || '');
              setEpisodesWatched(animeInLibrary.userEpisodes || 0);
              setRating(animeInLibrary.userRating || 0);
            }
          }
        } else {
          setAnime(null);
          setError("Anime not found.");
        }
      } catch (err) {
        console.error("Failed to fetch anime details:", err);
        setError(err.message);
        setAnime(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimeData();
  }, [id]);

  // Effect to save to Firestore when category, rating, or episodesWatched change
  useEffect(() => {
    const saveToFirestore = async () => {
      if (category && anime && anime.mal_id && auth.currentUser) {
        // Prepare the anime object for Firestore
        // Ensure images.jpg.large_image_url exists or provide a fallback
        const imageUrl = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '';

        const animeObjectForFirestore = {
          mal_id: anime.mal_id,
          title: anime.title,
          images: { jpg: { large_image_url: imageUrl } }, // Ensure this structure matches what addToLibraryFirestore expects
          score: anime.score,
          episodes: anime.episodes,
          type: anime.type,
          year: anime.year,
          // Ensure genres are an array of strings
          genres: Array.isArray(anime.genres) ? anime.genres.map(g => g.name || g) : [],
        };
        await addToLibraryFirestore(category, animeObjectForFirestore, rating, episodesWatched);
      }
    };

    // Only save if not loading and anime data is present
    if (!loading && anime) {
      saveToFirestore();
    }
  }, [category, rating, episodesWatched, anime, loading]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 dark:from-teal-950 dark:via-neutral-950 dark:to-emerald-950 text-gray-900 dark:text-gray-100">
        <p className="text-xl">Loading anime details...</p> {/* Optional: Add a loading spinner component here */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 dark:from-teal-950 dark:via-neutral-950 dark:to-emerald-950 text-red-600 dark:text-red-400 p-4">
        <p className="text-2xl font-semibold mb-2">Error</p>
        <p className="text-lg text-center">{error}</p>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 dark:from-teal-950 dark:via-neutral-950 dark:to-emerald-950 text-gray-700 dark:text-gray-300">
        <p className="text-xl">Anime not found.</p>
      </div>
    );
  }

  return (
    <div data-theme={theme} className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 dark:from-teal-950 dark:via-neutral-950 dark:to-emerald-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-green-200 via-teal-100 to-emerald-100 dark:from-neutral-800 dark:via-teal-900 dark:to-emerald-950 backdrop-blur-sm shadow-2xl rounded-xl p-6 md:p-10">
          <div className="md:flex md:gap-x-8 lg:gap-x-12">
            {/* Image Section */}
            <div className="md:w-1/3 lg:w-1/4 mb-6 md:mb-0 flex-shrink-0">
              <img
                src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || 'default_placeholder_image.png'}
                alt={anime.title}
                className="rounded-lg shadow-lg w-full h-auto object-cover aspect-[2/3]"
              />
            </div>

            {/* Details Section */}
            <div className="md:w-2/3 lg:w-3/4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 text-emerald-700 dark:text-green-300">{anime.title}</h1>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-5 flex flex-wrap gap-x-3 gap-y-1 items-center">
                <span>{anime.type}</span>
                {anime.episodes && <span>&bull; {anime.episodes} episodes</span>}
                {anime.score && <span>&bull; Score: {anime.score}</span>}
                {anime.year && <span>&bull; Year: {anime.year}</span>}
                {anime.rating && <span className="uppercase">&bull; {anime.rating}</span>}
              </div>

              {/* Library Controls */}
              {auth.currentUser && (
                <div className="my-6 p-4 bg-emerald-950 dark:bg-emerald-50 rounded-lg shadow">
                  <label className="block text-sm font-medium text-slate-100 dark:text-slate-900 mb-2">Manage in Library</label>
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="flex-grow w-full sm:w-auto p-3 bg-gray-50 dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 transition-all duration-200"
                    >
                      <option value="">Select Status</option>
                      <option value="watching">Watching</option>
                      <option value="completed">Completed</option>
                      <option value="planToWatch">Plan to Watch</option>
                      <option value="dropped">Dropped</option>
                      <option value="onHold">On Hold</option>
                    </select>

                    {category && category !== "" && (
                      <>
                        <input
                          type="number"
                          value={episodesWatched}
                          onChange={(e) => setEpisodesWatched(Math.max(0, parseInt(e.target.value) || 0))}
                          min="0"
                          max={anime.episodes || undefined}
                          placeholder="Ep. Watched"
                          className="w-full sm:w-32 p-3 bg-gray-50 dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-xl text-slate-900 dark:text-slate-100 text-center focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 transition-all duration-200"
                        />
                        <input
                          type="number"
                          value={rating}
                          onChange={(e) => setRating(Math.max(0, Math.min(10, parseFloat(e.target.value) || 0)))}
                          min="0"
                          max="10"
                          step="0.1"
                          placeholder="Rating (0-10)"
                          className="w-full sm:w-32 p-3 bg-gray-50 dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-xl text-slate-900 dark:text-slate-100 text-center focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 transition-all duration-200"
                        />
                      </>
                    )}
                  </div>
                </div>
              )}
              
              {anime.genres && anime.genres.length > 0 && (
                <div className="mb-5">
                  <h3 className="text-lg font-semibold mb-1 text-gray-700 dark:text-gray-300">Genres:</h3>
                  <div className="flex flex-wrap gap-2">
                    {anime.genres.map((genre) => (
                      <span key={genre.mal_id} className="px-3 py-1 bg-teal-100 dark:bg-teal-700 text-teal-800 dark:text-teal-200 rounded-full text-sm shadow-sm">
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">Synopsis</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap prose dark:prose-invert max-w-none">
                {anime.synopsis || 'No synopsis available.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
