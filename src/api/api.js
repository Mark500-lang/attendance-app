import axios from 'axios';

/**
 * Single Axios instance for the entire app.
 *
 * WHY ONE INSTANCE:
 * - Base URL is set once — change backend URL in .env only
 * - Request interceptor auto-attaches the Bearer token
 * - Response interceptor catches 401s globally so every
 *   component doesn't need its own "if 401 → logout" logic
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept':        'application/json',
    },
    timeout: 15000, // 15 seconds — important on mobile networks
});

// ── REQUEST INTERCEPTOR ───────────────────────────────────────────────────
// Runs before EVERY request. Pulls the token from localStorage and
// injects it into the Authorization header automatically.
// This means NO component ever manually handles the token.
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── RESPONSE INTERCEPTOR ──────────────────────────────────────────────────
// Runs after EVERY response. Catches 401 Unauthenticated globally.
// If the server says the token is invalid/expired, we clear storage
// and redirect to login — the user never sees a broken state.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or revoked — clean up and force re-login
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            // Use window.location so it works outside React component tree
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;

// ── NAMED API HELPERS ─────────────────────────────────────────────────────
// Centralised functions for every endpoint. Components import these,
// never call api.get/post directly. This means if the backend URL
// changes, you fix it here — not in 10 different components.

// Auth
export const authApi = {
    register: (data)  => api.post('/auth/register', data),
    login:    (data)  => api.post('/auth/login', data),
    logout:   ()      => api.post('/auth/logout'),
    me:       ()      => api.get('/auth/me'),
};

// Classes
export const classApi = {
    list:    ()       => api.get('/classes'),
    get:     (id)     => api.get(`/classes/${id}`),
    create:  (data)   => api.post('/classes', data),
    update:  (id, data) => api.put(`/classes/${id}`, data),
    remove:  (id)     => api.delete(`/classes/${id}`),
};

// Sessions
export const sessionApi = {
    list:    (params) => api.get('/sessions', { params }),
    get:     (id)     => api.get(`/sessions/${id}`),
    create:  (data)   => api.post('/sessions', data),
    remove:  (id)     => api.delete(`/sessions/${id}`),
};

// Attendance
export const attendanceApi = {
    mark:           (data) => api.post('/attendance/mark', data),
    myHistory:      ()     => api.get('/attendance/my-history'),
    sessionReport:  (id)   => api.get(`/attendance/session/${id}`),
    fullReport:     (params) => api.get('/attendance/report', { params }),
};

// Notifications
export const notificationApi = {
    list: () => api.get('/notifications'),
};