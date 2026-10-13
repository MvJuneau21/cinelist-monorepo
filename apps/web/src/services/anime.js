// src/services/anime.js
import api from './api';

export const getPopularAnime = async () => {
  try {
    const response = await api.get('/anime/');
    return response.data;
  } catch (error) {
    console.error('Error fetching popular anime:', error);
    throw error;
  }
};

export const searchAnime = async (name) => {
  try {
    const response = await api.post('/anime/search', { name });
    return response.data;
  } catch (error) {
    console.error('Error searching anime:', error);
    throw error;
  }
};