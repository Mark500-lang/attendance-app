import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRegCircleUser } from 'react-icons/fa6';
import { IoIosNotificationsOutline } from 'react-icons/io';
import { useStatusBar } from '../hooks/useStatusBar';
import { useAuth } from '../context/AuthContext';
import { attendanceApi, sessionApi } from '../api/api';
import './Dashboard.css';

const Dashboard = () => {
    const navigate  = useNavigate();
    useStatusBar('dark', '#1A1341');
    const { user, isLoading: authLoading } = useAuth();

    const [activeSessions,   setActiveSessions]   = useState([]);
    const [upcomingSessions, setUpcomingSessions] = useState([]);
    const [history,          setHistory]          = useState([]);
    const [loading,          setLoading]          = useState(true);

    useEffect(() => {
        if (authLoading) return;
        const load = async () => {
            try {
                const [activeRes, upcomingRes, historyRes] = await Promise.all([
                    sessionApi.list({ status: 'active' }),
                    sessionApi.list({ status: 'upcoming' }),
                    attendanceApi.myHistory(),
                ]);
                setActiveSessions(activeRes.data.data.sessions   || []);
                setUpcomingSessions(upcomingRes.data.data.sessions || []);
                setHistory(historyRes.data.data.attendances      || []);
            } catch (e) { console.error(e); }
            finally     { setLoading(false); }
        };
        load();
    }, [authLoading]);

    const firstName    = user?.name?.split(' ')[0] || 'Student';
    const totalClasses = history.length;

    // Group attendance by course for the mini breakdown
    const courseBreakdown = history.reduce((acc, a) => {
        const name = a.session?.class?.course_code || '—';
        acc[name]  = (acc[name] || 0) + 1;
        return acc;
    }, {});

    const fmt = (iso) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const fmtDate = (iso) => new Date(iso).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' });

    const now     = new Date();
    const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <div className="standalone-page">
            <div className="header">
                <div className="header-left-container">
                    <FaRegCircleUser
                        className="back-button"
                        onClick={() => navigate('/profile')}
                        aria-label="View profile"
                        color="#fff"
                    />
                    <h1 className="header-title">Dashboard</h1>
                </div>
                <IoIosNotificationsOutline
                    className="notification-icon"
                    onClick={() => navigate('/notifications')}
                    aria-label="Notifications"
                />
            </div>

            <div className="content db2-content">

                {/* ── Greeting hero ── */}
                <div className="db2-hero">
                    <div className="db2-hero-text">
                        <p className="db2-greeting">{greeting},</p>
                        <h2 className="db2-name">{firstName} 👋</h2>
                        <p className="db2-reg">{user?.registration_number}</p>
                    </div>
                    {/* Attendance streak pill */}
                    <div className="db2-streak">
                        <span className="db2-streak-num">{loading ? '—' : totalClasses}</span>
                        <span className="db2-streak-lbl">Attended</span>
                    </div>
                </div>

                {/* ── Active session alert ── */}
                {!loading && activeSessions.length > 0 && (
                    <div className="db2-alert">
                        <div className="db2-alert-pulse" />
                        <div className="db2-alert-text">
                            <p className="db2-alert-title">🔴 Session Live Now</p>
                            <p className="db2-alert-sub">
                                {activeSessions[0].class?.name} · {activeSessions[0].room_name}
                            </p>
                            <p className="db2-alert-closes">
                                Closes at {fmt(activeSessions[0].ends_at)}
                            </p>
                        </div>
                        <button
                            className="db2-alert-btn"
                            onClick={() => navigate('/attendance', { state: { preselectedSession: activeSessions[0] } })}
                        >
                            Mark
                        </button>
                    </div>
                )}

                {/* ── Stats row ── */}
                <div className="db2-stats">
                    <div className="db2-stat">
                        <span className="db2-stat-val">{loading ? '—' : totalClasses}</span>
                        <span className="db2-stat-lbl">Total Sessions</span>
                    </div>
                    <div className="db2-stat-divider" />
                    <div className="db2-stat">
                        <span className="db2-stat-val">{loading ? '—' : activeSessions.length}</span>
                        <span className="db2-stat-lbl">Active Now</span>
                    </div>
                    <div className="db2-stat-divider" />
                    <div className="db2-stat">
                        <span className="db2-stat-val">{loading ? '—' : Object.keys(courseBreakdown).length}</span>
                        <span className="db2-stat-lbl">Courses</span>
                    </div>
                </div>

                {/* ── Upcoming sessions ── */}
                <div className="db2-section">
                    <div className="db2-section-header">
                        <h3 className="db2-section-title">Upcoming Classes</h3>
                        <button className="db2-see-all" onClick={() => navigate('/attendance')}>See all</button>
                    </div>

                    {loading && <div className="db2-shimmer-list"><div className="db2-shimmer" /><div className="db2-shimmer" /></div>}

                    {!loading && upcomingSessions.length === 0 && activeSessions.length === 0 && (
                        <div className="db2-empty">
                            <span>📅</span><p>No upcoming classes scheduled.</p>
                        </div>
                    )}

                    {!loading && [...activeSessions, ...upcomingSessions].slice(0, 4).map((s) => (
                        <div key={s.id} className={`db2-session-card ${s.status === 'active' ? 'live' : ''}`}>
                            <div className="db2-sc-date">
                                <span className="db2-sc-day">{new Date(s.starts_at).toLocaleDateString([], { day: 'numeric' })}</span>
                                <span className="db2-sc-mon">{new Date(s.starts_at).toLocaleDateString([], { month: 'short' })}</span>
                            </div>
                            <div className="db2-sc-body">
                                <p className="db2-sc-course">{s.class?.name}</p>
                                <p className="db2-sc-meta">{s.room_name} · {fmt(s.starts_at)}–{fmt(s.ends_at)}</p>
                                <p className="db2-sc-code">{s.class?.course_code}</p>
                            </div>
                            <div className="db2-sc-right">
                                {s.status === 'active'
                                    ? <span className="db2-badge live">LIVE</span>
                                    : <span className="db2-badge upcoming">{fmt(s.starts_at)}</span>
                                }
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Recent attendance ── */}
                {!loading && history.length > 0 && (
                    <div className="db2-section">
                        <div className="db2-section-header">
                            <h3 className="db2-section-title">Recent Attendance</h3>
                            <button className="db2-see-all" onClick={() => navigate('/reports')}>View all</button>
                        </div>
                        {history.slice(0, 3).map((a) => (
                            <div key={a.id} className="db2-history-row">
                                <div className="db2-hr-dot" />
                                <div className="db2-hr-body">
                                    <p className="db2-hr-course">{a.session?.class?.name}</p>
                                    <p className="db2-hr-meta">{a.session?.room_name} · {fmtDate(a.marked_at)}</p>
                                </div>
                                <span className="db2-hr-check">✓</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Course breakdown ── */}
                {!loading && Object.keys(courseBreakdown).length > 0 && (
                    <div className="db2-section">
                        <h3 className="db2-section-title">Attendance by Course</h3>
                        {Object.entries(courseBreakdown).map(([code, count]) => {
                            const pct = Math.round((count / totalClasses) * 100);
                            return (
                                <div key={code} className="db2-course-row">
                                    <div className="db2-course-info">
                                        <span className="db2-course-code">{code}</span>
                                        <span className="db2-course-count">{count} session{count !== 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="db2-bar-track">
                                        <div className="db2-bar-fill" style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

            </div>
        </div>
    );
};

export default Dashboard;