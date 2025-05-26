// src/api.js

const BASE_URL = 'https://api.jikan.moe/v4';

export const fetchTopAnime = async (limit = 10) => {
  try {
    const res = await fetch(`${BASE_URL}/top/anime?limit=${limit}`);
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.error("Fetch top anime failed:", err);
    return [];
  }
};

export const fetchCurrentAnime = async (limit = 10) => {
  try {
    const res = await fetch(`${BASE_URL}/seasons/now?limit=${limit}`);
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.error("Fetch current anime failed:", err);
    return [];
  }
};

export const fetchUpcomingAnime = async (limit = 10) => {
  try {
    const res = await fetch(`${BASE_URL}/seasons/upcoming?limit=${limit}`);
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.error("Fetch upcoming anime failed:", err);
    return [];
  }
};

export const fetchAnimeById = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/anime/${id}`);
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.error(`Fetch anime by id (${id}) failed:`, err);
    return null;
  }
};
 
export const searchAnime = async (query) => {
  try {
    const res = await fetch(`${BASE_URL}/anime?q=${query}`);
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.error(`Search anime failed:`, err);
    return [];
  }
};


export const deduplicateAnime = (animeList) => {
  const seen = new Set();
  return animeList.filter(anime => {
    if (seen.has(anime.mal_id)) {
      return false;
    }
    seen.add(anime.mal_id);
    return true;
  });
};