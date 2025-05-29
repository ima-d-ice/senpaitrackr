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
    return <div className="flex justify-center items-center min-h-screen dark:bg-gray-900 dark:text-white">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen dark:bg-gray-900 dark:text-white">Error: {error}</div>;
  }

  if (!anime) {
    return <div className="flex justify-center items-center min-h-screen dark:bg-gray-900 dark:text-white">Anime not found.</div>;
  }

  return (
    <div data-theme={theme}>
      <div className="min-h-screen bg-amber-50 dark:bg-neutral-900 py-8 px-4 md:px-12">
        <div className="max-w-6xl mx-auto bg-neutral-200 dark:bg-zinc-600 shadow-xl rounded-lg p-6 md:p-8">
          <div className="md:flex">
            <div className="md:w-1/3 mb-6 md:mb-0 md:mr-8">
              <img
                src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || 'default_placeholder_image.png'}
                alt={anime.title}
                className="rounded-lg shadow-md w-full object-cover"
              />
            </div>
            <div className="md:w-2/3">
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-800 dark:text-white">{anime.title}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {anime.type} {anime.episodes ? `(${anime.episodes} episodes)` : ''} - Score: {anime.score || 'N/A'}
              </p>

              {auth.currentUser && ( // Only show controls if user is logged in
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

                  {category && category !== "" && ( // Show inputs only if a category is selected
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
              )}

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
