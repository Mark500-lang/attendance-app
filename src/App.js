import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Layout       from './components/Layout';
import Login        from './components/auth/Login';
import Dashboard    from './components/Dashboard';
import Attendance   from './components/Attendance';
import Reports      from './components/Reports';
import Notifications from './components/Notifications';
import Profile      from './components/Profile';
import EditProfile  from './components/EditProfile';
import Support      from './components/Support';

const ProtectedRoute = ({ children }) => {
    const { isLoggedIn, isLoading } = useAuth();
    if (isLoading) return <div className="app-loading" />;
    if (!isLoggedIn) return <Navigate to="/login" replace />;
    return children;
};

const PublicRoute = ({ children }) => {
    const { isLoggedIn, isLoading } = useAuth();
    if (isLoading) return <div className="app-loading" />;
    if (isLoggedIn) return <Navigate to="/" replace />;
    return children;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* ── PUBLIC ──────────────────────────────────── */}
                    <Route
                        path="/login"
                        element={<PublicRoute><Login /></PublicRoute>}
                    />

                    {/* ── PROTECTED (all share the Layout + BottomNav) ── */}
                    <Route
                        path="/"
                        element={<ProtectedRoute><Layout /></ProtectedRoute>}
                    >
                        {/* Main tabs */}
                        <Route index                element={<Dashboard />} />
                        <Route path="attendance"    element={<Attendance />} />
                        <Route path="reports"       element={<Reports />} />
                        <Route path="notifications" element={<Notifications />} />

                        {/* Profile and its sub-pages — all inside Layout
                            so the bottom nav stays visible throughout   */}
                        <Route path="profile"          element={<Profile />} />
                        <Route path="profile/edit"     element={<EditProfile />} />
                        <Route path="profile/support"  element={<Support />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;