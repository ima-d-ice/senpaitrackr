import React from 'react';

const AnimeCard = ({ id, name, src, score, episodes, type }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <img src={src} alt={name} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{name}</h3>
        <p className="text-gray-600 dark:text-gray-400">Score: {score}</p>
        <p className="text-gray-600 dark:text-gray-400">Episodes: {episodes}</p>
        <p className="text-gray-600 dark:text-gray-400">Type: {type}</p>
      </div>
    </div>
  );
};

export default AnimeCard;