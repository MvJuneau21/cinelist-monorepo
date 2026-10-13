// src/services/media.js
import api from './api';

export const getPopularMedia = async () => {
  try {
    const response = await api.get('/media/popular');
    return response.data;
  } catch (error) {
    console.error('Error fetching popular media:', error);
    throw error;
  }
};

export const searchMedia = async (name) => {
  try {
    const response = await api.post('/media/search', { name });
    return response.data;
  } catch (error) {
    console.error('Error searching media:', error);
    throw error;
  }
};

export const rateMedia = async (payload) => {
  try {
    const response = await api.post('/media/rate', payload);
    return response.data;
  } catch (error) {
    console.error('Error rating media:', error);
    throw error;
  }
};

export const updateRating = async (payload) => {
  try {
    const response = await api.put('/media/rate/update', payload);
    return response.data;
  } catch (error) {
    console.error('Error updating rating:', error);
    throw error;
  }
};

export const deleteRating = async (payload) => {
  try {
    const response = await api.delete('/media/rate/delete', { data: payload });
    return response.data;
  } catch (error) {
    console.error('Error deleting rating:', error);
    throw error;
  }
};

export const getUserRatings = async (userId) => {
  try {
    const response = await api.post('/media/rate/user/get', { user_id: userId });
    return response.data;
  } catch (error) {
    console.error('Error fetching user ratings:', error);
    throw error;
  }
};