import React from 'react';
import AnimeCard from './AnimeCard';

const AnimeList = ({ animeList }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 p-4 justify-items-center">
      {animeList.map(anime => (
        <AnimeCard
          key={anime.mal_id}
          id={anime.mal_id}
          name={anime.title}
          src={anime.images?.jpg?.image_url}
          score={anime.score}
          episodes={anime.episodes}
          type={anime.type}
        />
      ))}
    </div>
  );
};

export default AnimeList;