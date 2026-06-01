import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ══ AUTH ══
export const register       = (data) => API.post('/auth/register', data);
export const login          = (data) => API.post('/auth/login', data);
export const getMe          = ()     => API.get('/auth/me');
export const getAllPlayers   = ()     => API.get('/auth/players');
export const getAllClubs     = ()     => API.get('/auth/clubs');
export const resetPassword   = (data) => API.post('/auth/reset-password', data);
export const updateStats     = (data) => API.put('/auth/update-stats', data);

// ══ VIDEOS ══
export const uploadVideo  = (formData) => API.post('/videos/upload', formData);
export const getMyVideos  = ()         => API.get('/videos/my-videos');

// ══ NUTRITION ══
export const generatePlan = (data) => API.post('/nutrition/generate', data);
export const getMyPlan    = ()      => API.get('/nutrition/my-plan');

// ══ ADMIN ══
export const getClubs         = ()                   => API.get('/admin/clubs');
export const createClub       = (data)               => API.post('/admin/clubs', data);
export const addPlayerToClub  = (clubId, playerId)   => API.post(`/admin/clubs/${clubId}/players/${playerId}`);
export const getAllUsers       = ()                   => API.get('/admin/users');
export const getAdminStats    = ()                   => API.get('/admin/stats');
export const getGrowthStats   = ()                   => API.get('/admin/stats/growth');
export const deleteUser       = (userId)             => API.delete(`/admin/users/${userId}`);
export const updateUser       = (userId, data)       => API.put(`/admin/users/${userId}`, data);

// ══ CV Analysis ══
export const analyzeCV             = (clubId, formData) => API.post(`/cv/analyze/${clubId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getMyApplications     = ()                 => API.get('/cv/my-applications');
export const getMyCvApplications   = ()                 => API.get('/cv/my-cv-applications');
export const getClubCVApplications = ()                 => API.get('/cv/club-cv-applications');
export const applyToClub           = (clubId)           => API.post(`/cv/apply/${clubId}`);
export const cancelApplication     = (clubId)           => API.delete(`/cv/apply/${clubId}`);
export const offerPlayer           = (playerId)         => API.post(`/cv/offer-player/${playerId}`);
export const respondToOffer        = (clubId, status)   => API.put(`/cv/respond-offer/${clubId}?status=${status}`);
export const getClubRequests       = ()                 => API.get('/cv/club-requests');
export const getMyClubPlayers      = ()                 => API.get('/cv/my-players');
export const getSentOffers         = ()                 => API.get('/cv/sent-offers');
export const getPlayerOffers       = ()                 => API.get('/cv/my-offers');
export const cancelOffer           = (playerId)         => API.delete(`/cv/offer-player/${playerId}`);
export const removePlayerFromClub  = (playerId)         => API.delete(`/cv/remove-player/${playerId}`);
export const updateRequestStatus   = (requestId, status) => API.put(`/cv/club-requests/${requestId}?status=${status}`);

// ══ Club Dashboard ══
export const getClubAthletes       = ()           => API.get('/club/athletes');
export const getClubApplications2  = ()           => API.get('/club/applications');
export const updateAppStatus       = (id, status) => API.put(`/club/applications/${id}?status=${status}`);

// ══ NOTIFICATIONS ══
export const getNotifications  = ()    => API.get('/notifications/');
export const markNotifRead     = (id)  => API.put(`/notifications/${id}/read`);
export const markAllNotifsRead = ()    => API.put('/notifications/read-all');

// ══ JOB OFFERS ══
export const createJobOffer = (data) => API.post('/jobs/', data);
export const getAllJobs      = ()     => API.get('/jobs/');
export const getMyOffers    = ()     => API.get('/jobs/my-offers');
export const deleteJobOffer = (id)   => API.delete(`/jobs/${id}`);

export default API;