export const getLibrary = () => {
    return JSON.parse(localStorage.getItem("animeLibrary")) || {
        watching: [],
        completed: [],
        onHold: [],
        dropped: [],
        planToWatch: [],
    };
}
export const getAnimeFromLibrary = (id) => {
    const library = getLibrary();
    const allAnime = Object.values(library).flat();
    return allAnime.find(anime => anime.id === id);
}

export const saveLibrary = (lib) => {
    localStorage.setItem('animeLibrary', JSON.stringify(lib));
    window.dispatchEvent(new Event('libraryUpdated'));
  };

export   const addToLibrary = (targetCategory,anime,rating,episodesWatched) => {
    if (!targetCategory || !anime) return;
    const lib = getLibrary();
    // remove existing
    Object.keys(lib).forEach((key) => {
      lib[key] = lib[key].filter((a) => a.id !== anime.mal_id);
    });

    // Log the anime object to inspect its structure, especially anime.genres
    console.log('Anime object being added to library:', JSON.stringify(anime, null, 2));
    console.log('Anime genres property:', anime.genres);

    // add updated entry
    lib[targetCategory].push({
      id: anime.mal_id,
      title: anime.title,
      image: anime.images.jpg.large_image_url,
      score: anime.score,
      episodes: anime.episodes,
      type: anime.type,
      genres: anime.genres,
      year: anime.year,
      userEpisodes: episodesWatched,
      userRating: rating,
      watchType: targetCategory
    });
    saveLibrary(lib);
  };