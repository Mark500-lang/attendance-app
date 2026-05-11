import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRegCircleUser } from 'react-icons/fa6';
import { useStatusBar } from '../hooks/useStatusBar';
import { useAuth } from '../context/AuthContext';
import { attendanceApi, sessionApi } from '../api/api';
import './Dashboard.css';
import './Reports.css';;

const fmt     = (iso) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const fmtDate = (iso) => new Date(iso).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' });

const Reports = () => {
    const navigate = useNavigate();
    useStatusBar('dark', '#1A1341');
    const { isAdmin, isLoading: authLoading } = useAuth();

    const [history,     setHistory]     = useState([]);
    const [allSessions, setAllSessions] = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [error,       setError]       = useState('');
    const [activeTab,   setActiveTab]   = useState('overview'); // overview | history | courses

    useEffect(() => {
        if (authLoading) return;
        const load = async () => {
            setLoading(true); setError('');
            try {
                const [histRes, sessRes] = await Promise.all([
                    isAdmin ? attendanceApi.fullReport() : attendanceApi.myHistory(),
                    sessionApi.list({ status: 'ended' }),
                ]);
                setHistory(
                    isAdmin
                        ? histRes.data.data.attendances || []
                        : histRes.data.data.attendances || []
                );
                setAllSessions(sessRes.data.data.sessions || []);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load report data.');
                console.error('Reports error:', err.response?.data || err);
            } finally { setLoading(false); }
        };
        load();
    }, [authLoading, isAdmin]);

    // ── Derived analytics ─────────────────────────────────────────────────
    const analytics = useMemo(() => {
        if (!history.length) return null;

        // By course
        const byCourse = {};
        history.forEach((a) => {
            const code = a.session?.class?.course_code || 'Unknown';
            const name = a.session?.class?.name        || 'Unknown';
            if (!byCourse[code]) byCourse[code] = { code, name, count: 0, distances: [] };
            byCourse[code].count++;
            if (a.distance_meters) byCourse[code].distances.push(Number(a.distance_meters));
        });

        // By day of week (0=Sun … 6=Sat)
        const byDay = Array(7).fill(0);
        history.forEach((a) => {
            byDay[new Date(a.marked_at).getDay()]++;
        });

        // By week (last 6 weeks)
        const byWeek = {};
        history.forEach((a) => {
            const d    = new Date(a.marked_at);
            const mon  = new Date(d); mon.setDate(d.getDate() - ((d.getDay() + 6) % 7));
            const key  = mon.toISOString().slice(0, 10);
            byWeek[key] = (byWeek[key] || 0) + 1;
        });
        const weekEntries = Object.entries(byWeek).sort().slice(-6);

        // Avg distance
        const distances  = history.map((a) => Number(a.distance_meters)).filter(Boolean);
        const avgDistance = distances.length ? Math.round(distances.reduce((s, d) => s + d, 0) / distances.length) : 0;

        // Attendance rate vs total past sessions
        const rate = allSessions.length > 0
            ? Math.round((history.length / allSessions.length) * 100)
            : null;

        const maxWeek = Math.max(...weekEntries.map(([, v]) => v), 1);
        const maxDay  = Math.max(...byDay, 1);

        return { byCourse, byDay, weekEntries, avgDistance, rate, maxWeek, maxDay };
    }, [history, allSessions]);

    const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    if (authLoading) return <div className="standalone-page" />;

    return (
        <div className="standalone-page">
            <div className="header">
                <div className="header-left-container">
                    <FaRegCircleUser
                        className="back-button"
                        onClick={() => navigate('/profile')}
                        color="#fff"
                    />
                    <h1 className="header-title">Reports</h1>
                </div>
            </div>

            <div className="content rv2-content">

                {error && <div className="rv2-error">⚠ {error}</div>}
                {loading && (
                    <div className="rv2-loading-list">
                        <div className="db2-shimmer" style={{ height: 120, borderRadius: 16 }} />
                        <div className="db2-shimmer" style={{ height: 200, borderRadius: 16 }} />
                        <div className="db2-shimmer" style={{ height: 160, borderRadius: 16 }} />
                    </div>
                )}

                {!loading && !error && (
                    <>
                        {/* ── Hero stats ── */}
                        <div className="rv2-hero">
                            <div className="rv2-hero-main">
                                <span className="rv2-big-num">{history.length}</span>
                                <span className="rv2-big-label">Sessions Attended</span>
                            </div>
                            {analytics?.rate !== null && analytics?.rate !== undefined && (
                                <div className="rv2-rate-ring" style={{ '--rate': analytics.rate }}>
                                    <svg viewBox="0 0 48 48" className="rv2-ring-svg">
                                        <circle cx="24" cy="24" r="20" className="rv2-ring-bg" />
                                        <circle cx="24" cy="24" r="20" className="rv2-ring-fg"
                                            strokeDasharray={`${analytics.rate * 1.257} 125.7`}
                                        />
                                    </svg>
                                    <span className="rv2-ring-label">{analytics.rate}%</span>
                                    <span className="rv2-ring-sub">Rate</span>
                                </div>
                            )}
                            {analytics?.avgDistance > 0 && (
                                <div className="rv2-hero-side">
                                    <span className="rv2-side-val">{analytics.avgDistance}m</span>
                                    <span className="rv2-side-lbl">Avg Distance</span>
                                </div>
                            )}
                        </div>

                        {/* ── Tab bar ── */}
                        <div className="rv2-tabs">
                            {[['overview','Overview'],['history','History'],['courses','Courses']].map(([id, lbl]) => (
                                <button
                                    key={id}
                                    className={`rv2-tab ${activeTab === id ? 'active' : ''}`}
                                    onClick={() => setActiveTab(id)}
                                >{lbl}</button>
                            ))}
                        </div>

                        {history.length === 0 && (
                            <div className="rv2-empty"><span>📋</span><p>No attendance records yet.</p></div>
                        )}

                        {/* ══════════ OVERVIEW ══════════ */}
                        {activeTab === 'overview' && analytics && (
                            <>
                                {/* Weekly attendance bar chart */}
                                <div className="rv2-card">
                                    <p className="rv2-card-title">Weekly Attendance (Last 6 Weeks)</p>
                                    <div className="rv2-bar-chart">
                                        {analytics.weekEntries.map(([week, count]) => (
                                            <div key={week} className="rv2-bar-col">
                                                <span className="rv2-bar-val">{count}</span>
                                                <div
                                                    className="rv2-bar"
                                                    style={{ height: `${(count / analytics.maxWeek) * 100}%` }}
                                                />
                                                <span className="rv2-bar-lbl">
                                                    {new Date(week).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                        ))}
                                        {analytics.weekEntries.length === 0 && (
                                            <p className="rv2-chart-empty">No data yet</p>
                                        )}
                                    </div>
                                </div>

                                {/* Day-of-week heatmap */}
                                <div className="rv2-card">
                                    <p className="rv2-card-title">Attendance by Day of Week</p>
                                    <div className="rv2-day-row">
                                        {DAY_LABELS.map((day, i) => (
                                            <div key={day} className="rv2-day-col">
                                                <div
                                                    className="rv2-day-dot"
                                                    style={{
                                                        opacity: analytics.byDay[i]
                                                            ? 0.25 + (analytics.byDay[i] / analytics.maxDay) * 0.75
                                                            : 0.08,
                                                        transform: `scale(${0.6 + (analytics.byDay[i] / analytics.maxDay) * 0.4})`
                                                    }}
                                                />
                                                <span className="rv2-day-lbl">{day}</span>
                                                <span className="rv2-day-count">{analytics.byDay[i] || ''}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Course attendance breakdown */}
                                <div className="rv2-card">
                                    <p className="rv2-card-title">By Course</p>
                                    {Object.values(analytics.byCourse).map((c) => {
                                        const pct = Math.round((c.count / history.length) * 100);
                                        return (
                                            <div key={c.code} className="rv2-course-row">
                                                <div className="rv2-course-info">
                                                    <span className="rv2-course-code">{c.code}</span>
                                                    <span className="rv2-course-name">{c.name}</span>
                                                </div>
                                                <div className="rv2-course-right">
                                                    <div className="rv2-h-bar-track">
                                                        <div className="rv2-h-bar-fill" style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <span className="rv2-course-count">{c.count}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        {/* ══════════ HISTORY ══════════ */}
                        {activeTab === 'history' && (
                            <div className="rv2-history-list">
                                {history.map((a) => (
                                    <div key={a.id} className="rv2-history-card">
                                        <div className="rv2-hc-left">
                                            <div className="rv2-hc-icon">✓</div>
                                        </div>
                                        <div className="rv2-hc-body">
                                            <p className="rv2-hc-course">{a.session?.class?.name ?? '—'}</p>
                                            <p className="rv2-hc-meta">
                                                {a.session?.room_name} · {fmtDate(a.marked_at)} · {fmt(a.marked_at)}
                                            </p>
                                            {isAdmin && a.student && (
                                                <p className="rv2-hc-student">
                                                    👤 {a.student.name} · {a.student.registration_number}
                                                </p>
                                            )}
                                        </div>
                                        {a.distance_meters && (
                                            <span className="rv2-hc-dist">
                                                {Number(a.distance_meters).toFixed(0)}m
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ══════════ COURSES ══════════ */}
                        {activeTab === 'courses' && analytics && (
                            <div className="rv2-courses-grid">
                                {Object.values(analytics.byCourse).map((c) => {
                                    const avgDist = c.distances.length
                                        ? Math.round(c.distances.reduce((s, d) => s + d, 0) / c.distances.length)
                                        : null;
                                    return (
                                        <div key={c.code} className="rv2-course-card">
                                            <div className="rv2-cc-top">
                                                <span className="rv2-cc-code">{c.code}</span>
                                                <span className="rv2-cc-count">{c.count}</span>
                                            </div>
                                            <p className="rv2-cc-name">{c.name}</p>
                                            <div className="rv2-cc-bar-track">
                                                <div
                                                    className="rv2-cc-bar"
                                                    style={{ width: `${Math.round((c.count / history.length) * 100)}%` }}
                                                />
                                            </div>
                                            {avgDist && (
                                                <p className="rv2-cc-dist">Avg {avgDist}m from room</p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Reports;