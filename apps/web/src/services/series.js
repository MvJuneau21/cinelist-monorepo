// src/services/series.js
import api from './api';

export const getPopularSeries = async () => {
  try {
    const response = await api.get('/series/');
    return response.data;
  } catch (error) {
    console.error('Error fetching popular series:', error);
    throw error;
  }
};

export const searchSeries = async (name) => {
  try {
    const response = await api.post('/series/search', { name });
    return response.data;
  } catch (error) {
    console.error('Error searching series:', error);
    throw error;
  }
};