import axios from 'axios';

const api = axios.create({
  baseURL:import.meta.env.VITE_BACKEND_URL,
  withCredentials: true, // ⚡ Tells the browser to get the cookies and put that with the requests
});

// --- AUTH ---
export const checkMe = () => api.get('/auth/me');
export const logout = () => api.post('/auth/logout');
// --- AUTHENTICATION ---

// ⚡ loginUser sends credentials and returns user data
export const loginUser = (credentials) => api.post("/auth/login", credentials);

// ⚡ registerUser sends name, email, and password
export const registerUser = (userData) => api.post("/auth/register", userData);

// ⚡ Google Auth Link
export const GOOGLE_AUTH_URL = import.meta.env.VITE_GOOGLE_AUTH_URL;

// --- THEATER MANAGEMENT ---
export const getAllTheaters = () => api.get('/theaters');
export const addTheater = (data) => api.post('/theaters', data);
export const updateTheater = (id, data) => api.put(`/theaters/${id}`, data);
export const deleteTheater = (id) => api.delete(`/theaters/${id}`);

// --- SCREEN MANAGEMENT (⚡ Fixes AdminScreenManager error) ---
export const addScreen = (data) => api.post('/screens', data);
export const deleteScreen = (id) => api.delete(`/screens/${id}`);
// ✅ Corrected to match @GetMapping("/theater/{theaterId}")
export const getScreensByTheater = (theaterId) => api.get(`/screens/theater/${theaterId}`);

// --- SEAT MANAGEMENT (⚡ For AdminSeatManager) ---
// Note: Ensure your Spring Boot @RequestMapping matches these paths
export const addSeats = (data) => api.post('/seats', data); 
export const getSeatsByScreen = (screenId) => api.get(`/seats/screen/${screenId}`);
export const clearScreenLayout = (screenId) => api.delete(`/seats/screen/${screenId}`);

// --- MOVIE MANAGEMENT ---
export const getAllMovies = () => api.get("/movies/getallmovies");
export const searchOmdb = (title) => api.get("/movies/omdb/search", { 
    params: { title } 
});
export const importMovie = (imdbId) => api.post(`/movies/omdb/import/${imdbId}`);
export const deleteMovie = (id) => api.delete(`/movies/deletemovie/${id}`);
export const addMovie = (movieData) => api.post("/movies/addmovie", movieData);
export const updateMovie = (id, movieData) => api.put(`/movies/updatemovie/${id}`, movieData);
export const searchMovies = (title) => api.get("/movies/search", { 
    params: { title } 
});

// --- SHOW MANAGEMENT ---

export const addShow = (showData) => api.post('/shows', showData);
export const getShowsByMovie = (movieId) => api.get(`/shows/movie/${movieId}`);
export const deleteShow = (showId) => api.delete(`/shows/${showId}`);
// Add this new export
export const getAllShows = () => api.get("/shows/all");

// api.js
export const getFilteredShows = (params) => {
    // ⚡ Ensure we don't send empty strings as params, send null or undefined instead
    const cleanParams = {
        movieId: params.movieId || undefined,
        city: params.city === 'All' ? undefined : params.city,
        date: params.date // Should be "2026-01-04"
    };
    return api.get('/shows', { params: cleanParams });
};


export const getShowById = (showId) => api.get(`/shows/${showId}`);
export const getShowSeats = (showId) => api.get(`/shows/${showId}/seats`);

// ⚡ NEW: Create a pending booking and get Stripe Client Secret
export const createBooking = (bookingData) => api.post('/booking/createbooking', bookingData);

// ⚡ NEW: Finalize booking after Stripe payment is successful
export const confirmBooking = (bookingId) => api.post(`/booking/${bookingId}/confirm`);
export const getMyBookings = () => api.get('/booking/mybookings');


export default api;