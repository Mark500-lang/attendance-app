import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Layout       from './components/Layout';
import Login        from './components/auth/Login';
import Dashboard    from './components/Dashboard';
import Attendance   from './components/Attendance';
import Reports      from './components/Reports';
import Notifications from './components/Notifications';

/**
 * ProtectedRoute — wraps any route that requires authentication.
 *
 * Three states:
 *  1. isLoading → show nothing (prevents flash of login page on refresh)
 *  2. isLoggedIn → render the child component normally
 *  3. not logged in → redirect to /login, preserving intended destination
 */
const ProtectedRoute = ({ children }) => {
    const { isLoggedIn, isLoading } = useAuth();

    // While hydrating from localStorage, render nothing to avoid flicker
    if (isLoading) {
        return <div className="app-loading" />;
    }

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

/**
 * PublicRoute — redirects already-logged-in users away from /login.
 * Prevents a logged-in user from seeing the login screen.
 */
const PublicRoute = ({ children }) => {
    const { isLoggedIn, isLoading } = useAuth();

    if (isLoading) {
        return <div className="app-loading" />;
    }

    if (isLoggedIn) {
        return <Navigate to="/" replace />;
    }

    return children;
};

function App() {
    return (
        // AuthProvider must wrap Router so useAuth() works in route components
        <AuthProvider>
            <Router>
                <Routes>
                    {/* ── PUBLIC ─────────────────────────────────────── */}
                    <Route
                        path="/login"
                        element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        }
                    />

                    {/* ── PROTECTED ──────────────────────────────────── */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Layout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index           element={<Dashboard />} />
                        <Route path="attendance"    element={<Attendance />} />
                        <Route path="reports"       element={<Reports />} />
                        <Route path="notifications" element={<Notifications />} />
                    </Route>

                    {/* ── CATCH-ALL ───────────────────────────────────── */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;