import { fetchAnimeSuggestionsAPI, fetchSearchedAnime, fetchInitialAnimeList } from './apiService';

const fetchFilteredAnime = async (query, filters, page = 1) => {
  const { genre, year, format } = filters;
  const genreParam = genre ? `&genre=${genre}` : '';
  const yearParam = year ? `&year=${year}` : '';
  const formatParam = format ? `&format=${format}` : '';

  const res = await fetch(`https://api.jikan.moe/v4/anime?q=${query}&page=${page}&limit=12&sfw=true${genreParam}${yearParam}${formatParam}`);
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status} for filtered search`);
  }
  const responseData = await res.json();
  return {
    data: responseData.data || [],
    pagination: responseData.pagination || null,
  };
};

export {
  fetchAnimeSuggestionsAPI,
  fetchSearchedAnime,
  fetchInitialAnimeList,
  fetchFilteredAnime,
};