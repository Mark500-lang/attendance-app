import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/api';

/**
 * AuthContext provides authentication state to the entire app.
 *
 * What it stores:
 *  - user        → the authenticated user object (or null)
 *  - token       → the Bearer token (or null)
 *  - isLoading   → true while we're checking localStorage on startup
 *  - isLoggedIn  → derived boolean for clean conditional rendering
 *
 * On app startup, we read from localStorage to restore the session.
 * This means the user stays logged in across page refreshes.
 */
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user,      setUser]      = useState(null);
    const [token,     setToken]     = useState(null);
    const [isLoading, setIsLoading] = useState(true); // true until hydration done

    // ── HYDRATE FROM LOCALSTORAGE ON APP START ────────────────────────────
    // On every app load, check if we have a stored token.
    // If yes, verify it's still valid by calling /auth/me.
    // If the server rejects it (401), the response interceptor in api.js
    // clears storage — so we don't need to handle that here.
    useEffect(() => {
        const hydrate = async () => {
            const storedToken = localStorage.getItem('auth_token');
            const storedUser  = localStorage.getItem('auth_user');

            if (storedToken && storedUser) {
                try {
                    // Set token first so the interceptor can attach it
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));

                    // Verify token is still valid with the server
                    const response = await authApi.me();
                    // Update user data in case it changed since last login
                    setUser(response.data.data.user);
                    localStorage.setItem(
                        'auth_user',
                        JSON.stringify(response.data.data.user)
                    );
                } catch {
                    // Token rejected by server — clear everything
                    clearAuth();
                }
            }

            setIsLoading(false);
        };

        hydrate();
    }, []);

    // ── LOGIN ─────────────────────────────────────────────────────────────
    const login = useCallback(async (registrationNumber, password, fcmToken = null) => {
        const payload = {
            registration_number: registrationNumber,
            password,
            ...(fcmToken && { fcm_token: fcmToken }),
        };

        const response = await authApi.login(payload);
        const { token: newToken, user: newUser } = response.data.data;

        // Persist to localStorage for session restore on refresh
        localStorage.setItem('auth_token', newToken);
        localStorage.setItem('auth_user', JSON.stringify(newUser));

        setToken(newToken);
        setUser(newUser);

        return newUser; // Return user so Login page can redirect by role
    }, []);

    // ── LOGOUT ────────────────────────────────────────────────────────────
    const logout = useCallback(async () => {
        try {
            await authApi.logout(); // Tell server to revoke the token
        } catch {
            // Even if server call fails, clear local state
            // This handles the case where the token is already expired
        } finally {
            clearAuth();
        }
    }, []);

    // ── CLEAR LOCAL AUTH STATE ────────────────────────────────────────────
    const clearAuth = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        token,
        isLoading,
        isLoggedIn: !!token && !!user,
        login,
        logout,
        isAdmin:   user?.role === 'admin',
        isStudent: user?.role === 'student',
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// ── HOOK ──────────────────────────────────────────────────────────────────
// Every component uses: const { user, login, logout, isLoggedIn } = useAuth();
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;