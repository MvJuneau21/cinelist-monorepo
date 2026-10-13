// src/services/movies.js
import api from './api';

export const getPopularMovies = async () => {
  try {
    const response = await api.get('/movies/');
    return response.data;
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    throw error;
  }
};

export const searchMovies = async (name) => {
  try {
    const response = await api.post('/movies/search', { name });
    return response.data;
  } catch (error) {
    console.error('Error searching movies:', error);
    throw error;
  }
};