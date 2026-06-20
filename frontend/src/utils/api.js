import axios from 'axios';

// Determine the correct backend URL based on where the app is running.
// - On localhost (dev): use local backend or VITE_API_URL override
// - On any deployed domain (Vercel, etc.): always use the Render backend
const getAPIBaseURL = () => {
  const hostname = window.location.hostname;
  const isLocalDev = hostname === 'localhost' || hostname === '127.0.0.1';

  if (isLocalDev) {
    // Development: honour VITE_API_URL or fall back to local server
    return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  }

  // Production (Vercel or any other host): use Render backend.
  // VITE_API_URL can still override this if set in the Vercel dashboard.
  return import.meta.env.VITE_API_URL || 'https://leave-management-system-tn2p.onrender.com/api';
};

export const getBackendURL = () => {
  return getAPIBaseURL().replace(/\/api\/?$/, '');
};

const api = axios.create({
  baseURL: getAPIBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token in every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle global errors (e.g. token expiration)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const token = localStorage.getItem('token');
      if (token) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
