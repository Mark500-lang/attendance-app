import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStatusBar } from '../../hooks/useStatusBar';
import './Login.css';

const Login = () => {
    const navigate  = useNavigate();
    const { login } = useAuth();
    useStatusBar('dark', '#1A1341');

    const [form, setForm] = useState({
        registration_number: '',
        password:            '',
    });
    const [error,     setError]     = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setError(''); // Clear error on any change
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.registration_number.trim() || !form.password.trim()) {
            setError('Please fill in all fields.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const user = await login(form.registration_number, form.password);
            // Redirect based on role — admins and students see same pages
            // but role-gating happens inside each component
            navigate('/', { replace: true });
        } catch (err) {
            const message = err.response?.data?.message
                || 'Login failed. Please check your credentials.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* ── Status bar area ── */}
            <div className="login-status-bar" />

            {/* ── Header matching Dashboard style ── */}
            <div className="login-header">
                <h1 className="login-header-title">GPS Attendance</h1>
                <p className="login-header-sub">JKUAT</p>
            </div>

            {/* ── Card ── */}
            <div className="login-body">
                <div className="login-card">
                    <div className="login-card-top">
                        <div className="login-avatar">
                            <span>🎓</span>
                        </div>
                        <h2 className="login-card-title">Welcome back</h2>
                        <p className="login-card-sub">
                            Sign in with your registration number
                        </p>
                    </div>

                    <form className="login-form" onSubmit={handleSubmit} noValidate>
                        <div className="login-field">
                            <label className="login-label" htmlFor="registration_number">
                                Registration Number
                            </label>
                            <input
                                id="registration_number"
                                name="registration_number"
                                type="text"
                                className="login-input"
                                placeholder="e.g. SCT211-0123-2021"
                                value={form.registration_number}
                                onChange={handleChange}
                                autoComplete="username"
                                autoCapitalize="characters"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="login-field">
                            <label className="login-label" htmlFor="password">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                className="login-input"
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={handleChange}
                                autoComplete="current-password"
                                disabled={isLoading}
                            />
                        </div>

                        {error && (
                            <div className="login-error" role="alert">
                                <span className="login-error-icon">⚠</span>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className={`login-btn ${isLoading ? 'loading' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="login-spinner" />
                                    Signing in…
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>
                </div>

                <p className="login-footer">
                    GPS-Based Attendance System · JKUAT Final Project
                </p>
            </div>
        </div>
    );
};

export default Login;