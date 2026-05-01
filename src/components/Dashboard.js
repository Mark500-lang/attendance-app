import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { RiMenu2Line } from 'react-icons/ri';
import { IoIosNotificationsOutline } from 'react-icons/io';
import { useStatusBar } from '../hooks/useStatusBar';
import { useAuth } from '../context/AuthContext';
import { attendanceApi, sessionApi } from '../api/api';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const context  = useOutletContext();
    const toggleSidebar = context?.toggleSidebar ?? (() => {});
    useStatusBar('dark', '#1A1341');

    const { user } = useAuth();

    const [stats, setStats]       = useState({ totalAttended: 0 });
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading]   = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [historyRes, sessionsRes] = await Promise.all([
                    attendanceApi.myHistory(),
                    sessionApi.list({ status: 'active' }),
                ]);

                setStats({
                    totalAttended: historyRes.data.data.total || 0,
                });
                setSessions(sessionsRes.data.data.sessions || []);
            } catch (err) {
                console.error('Dashboard load error:', err);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    const firstName = user?.name?.split(' ')[0] || 'Student';

    return (
        <div className="standalone-page">
            {/* ── Header — identical structure to your original ── */}
            <div className="header">
                <div className="header-left-container">
                    <RiMenu2Line
                        className="back-button"
                        onClick={toggleSidebar}
                        aria-label="Open menu"
                        color="rgb(255, 255, 255)"
                    />
                    <h1 className="header-title">Dashboard</h1>
                </div>
                <IoIosNotificationsOutline
                    className="notification-icon"
                    onClick={() => navigate('/notifications')}
                    aria-label="View notifications"
                />
            </div>

            {/* ── Content ── */}
            <div className="content dashboard-content">
                {/* Greeting */}
                <div className="dash-greeting">
                    <p className="dash-greeting-sub">Good day,</p>
                    <h2 className="dash-greeting-name">{firstName} 👋</h2>
                    <p className="dash-greeting-reg">{user?.registration_number}</p>
                </div>

                {/* Stats row */}
                <div className="dash-stats-row">
                    <div className="dash-stat-card">
                        <span className="dash-stat-value">
                            {loading ? '—' : stats.totalAttended}
                        </span>
                        <span className="dash-stat-label">Sessions Attended</span>
                    </div>
                    <div className="dash-stat-card accent">
                        <span className="dash-stat-value">
                            {loading ? '—' : sessions.length}
                        </span>
                        <span className="dash-stat-label">Active Now</span>
                    </div>
                </div>

                {/* Active sessions */}
                <div className="dash-section">
                    <h3 className="dash-section-title">Active Sessions</h3>

                    {loading && (
                        <div className="dash-loading">Loading sessions…</div>
                    )}

                    {!loading && sessions.length === 0 && (
                        <div className="dash-empty">
                            <span className="dash-empty-icon">📭</span>
                            <p>No active sessions right now.</p>
                        </div>
                    )}

                    {!loading && sessions.map((session) => (
                        <div key={session.id} className="dash-session-card">
                            <div className="dash-session-left">
                                <span className="dash-session-room">{session.room_name}</span>
                                <span className="dash-session-class">
                                    {session.class?.name} · {session.class?.course_code}
                                </span>
                                <span className="dash-session-time">
                                    Closes {new Date(session.ends_at).toLocaleTimeString([], {
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                </span>
                            </div>
                            <button
                                className="dash-session-btn"
                                onClick={() => navigate('/attendance', {
                                    state: { preselectedSession: session }
                                })}
                            >
                                Mark
                            </button>
                        </div>
                    ))}
                </div>

                {/* Quick actions */}
                <div className="dash-section">
                    <h3 className="dash-section-title">Quick Actions</h3>
                    <div className="dash-actions-row">
                        <button
                            className="dash-action-btn"
                            onClick={() => navigate('/attendance')}
                        >
                            <span className="dash-action-icon">📍</span>
                            <span>Mark Attendance</span>
                        </button>
                        <button
                            className="dash-action-btn"
                            onClick={() => navigate('/reports')}
                        >
                            <span className="dash-action-icon">📋</span>
                            <span>My Reports</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;