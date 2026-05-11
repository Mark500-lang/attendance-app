import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaRegCircleUser } from 'react-icons/fa6';
import { useStatusBar } from '../hooks/useStatusBar';
import { useAuth } from '../context/AuthContext';
import { sessionApi, attendanceApi } from '../api/api';
import './Dashboard.css';
import './Attendance.css';

const GPS_STATE = { IDLE: 'idle', FETCHING: 'fetching', READY: 'ready', ERROR: 'error' };

const fmt      = (iso) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const fmtDate  = (iso) => new Date(iso).toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' });
const fmtShort = (iso) => new Date(iso).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' });

const Attendance = () => {
    const navigate      = useNavigate();
    const routeLocation = useLocation();
    useStatusBar('dark', '#1A1341');
    const { user, isLoading: authLoading } = useAuth();

    const [activeSessions,   setActiveSessions]   = useState([]);
    const [upcomingSessions, setUpcomingSessions]  = useState([]);
    const [pastSessions,     setPastSessions]      = useState([]);
    const [history,          setHistory]           = useState([]); // student's marked records
    const [loading,          setLoading]           = useState(true);

    const [selectedSession,  setSelectedSession]   = useState(null);
    const [activeTab,        setActiveTab]         = useState('mark'); // 'mark' | 'upcoming' | 'past'

    const [gpsState,  setGpsState]  = useState(GPS_STATE.IDLE);
    const [gpsCoords, setGpsCoords] = useState(null);
    const [gpsError,  setGpsError]  = useState('');
    const [marking,   setMarking]   = useState(false);
    const [markResult,setMarkResult]= useState(null);
    const [markError, setMarkError] = useState('');

    useEffect(() => {
        if (authLoading) return;
        const load = async () => {
            try {
                const [activeRes, upcomingRes, pastRes, historyRes] = await Promise.all([
                    sessionApi.list({ status: 'active' }),
                    sessionApi.list({ status: 'upcoming' }),
                    sessionApi.list({ status: 'ended' }),
                    attendanceApi.myHistory(),
                ]);
                const active   = activeRes.data.data.sessions    || [];
                const upcoming = upcomingRes.data.data.sessions  || [];
                const past     = pastRes.data.data.sessions      || [];
                const hist     = historyRes.data.data.attendances || [];

                setActiveSessions(active);
                setUpcomingSessions(upcoming);
                setPastSessions(past.slice(0, 10)); // last 10
                setHistory(hist);

                const preselected = routeLocation.state?.preselectedSession;
                if (preselected) setSelectedSession(preselected);
                else if (active.length === 1) setSelectedSession(active[0]);
            } catch (e) { console.error(e); }
            finally     { setLoading(false); }
        };
        load();
    }, [authLoading]);

    // Has student already marked this session?
    const alreadyMarked = (sessionId) =>
        history.some((h) => h.session?.id === sessionId);

    const fetchGps = () => {
        if (!navigator.geolocation) {
            setGpsState(GPS_STATE.ERROR);
            setGpsError('GPS not supported on this device.');
            return;
        }
        setGpsState(GPS_STATE.FETCHING);
        setGpsError(''); setMarkResult(null); setMarkError('');
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setGpsCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude, accuracy: Math.round(pos.coords.accuracy) });
                setGpsState(GPS_STATE.READY);
            },
            (err) => {
                setGpsState(GPS_STATE.ERROR);
                const msgs = {
                    1: 'Location permission denied. Please allow in browser settings.',
                    2: 'Location unavailable. Try outdoors.',
                    3: 'Location request timed out.',
                };
                setGpsError(msgs[err.code] || 'Failed to get location.');
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    };

    const handleMark = async () => {
        if (!selectedSession || gpsState !== GPS_STATE.READY) return;
        setMarking(true); setMarkError(''); setMarkResult(null);
        try {
            const res = await attendanceApi.mark({
                session_id: selectedSession.id,
                latitude:   gpsCoords.lat,
                longitude:  gpsCoords.lon,
            });
            setMarkResult(res.data.data.attendance);
            setGpsCoords(null); setGpsState(GPS_STATE.IDLE);
            // Refresh history
            const h = await attendanceApi.myHistory();
            setHistory(h.data.data.attendances || []);
        } catch (err) {
            setMarkError(err.response?.data?.message || 'Failed to mark attendance.');
        } finally { setMarking(false); }
    };

    const canMark = selectedSession?.status === 'active';

    // Find previous class (last ended session that student attended)
    const lastAttended = history[0] ?? null;

    // Find next class (first upcoming)
    const nextClass = upcomingSessions[0] ?? null;

    return (
        <div className="standalone-page">
            <div className="header">
                <div className="header-left-container">
                    <FaRegCircleUser
                        className="back-button"
                        onClick={() => navigate('/profile')}
                        color="#fff"
                    />
                    <h1 className="header-title">Attendance</h1>
                </div>
            </div>

            <div className="content att2-content">

                {/* ── Previous / Next class cards ── */}
                <div className="att2-context-row">
                    {/* Last attended */}
                    <div className="att2-ctx-card prev">
                        <span className="att2-ctx-label">Last Class</span>
                        {loading
                            ? <span className="att2-ctx-val">—</span>
                            : lastAttended
                                ? <>
                                    <span className="att2-ctx-val">{lastAttended.session?.class?.course_code}</span>
                                    <span className="att2-ctx-sub">{lastAttended.session?.room_name}</span>
                                    <span className="att2-ctx-time">{fmtShort(lastAttended.marked_at)}</span>
                                  </>
                                : <span className="att2-ctx-val">None yet</span>
                        }
                    </div>

                    {/* Next class */}
                    <div className="att2-ctx-card next">
                        <span className="att2-ctx-label">Next Class</span>
                        {loading
                            ? <span className="att2-ctx-val">—</span>
                            : nextClass
                                ? <>
                                    <span className="att2-ctx-val">{nextClass.class?.course_code}</span>
                                    <span className="att2-ctx-sub">{nextClass.room_name}</span>
                                    <span className="att2-ctx-time">{fmtShort(nextClass.starts_at)} · {fmt(nextClass.starts_at)}</span>
                                  </>
                                : <span className="att2-ctx-val">None scheduled</span>
                        }
                    </div>
                </div>

                {/* ── Tab bar ── */}
                <div className="att2-tabs">
                    {[['mark', 'Mark Attendance'], ['upcoming', 'Schedule'], ['past', 'Past Sessions']].map(([id, label]) => (
                        <button
                            key={id}
                            className={`att2-tab ${activeTab === id ? 'active' : ''}`}
                            onClick={() => setActiveTab(id)}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* ══════════ TAB: MARK ATTENDANCE ══════════ */}
                {activeTab === 'mark' && (
                    <>
                        {/* Success banner */}
                        {markResult && (
                            <div className="att2-success">
                                <span>✅</span>
                                <div>
                                    <p className="att2-success-title">Attendance Marked!</p>
                                    <p className="att2-success-sub">{markResult.session?.class} · {markResult.session?.room_name}</p>
                                    <p className="att2-success-dist">{markResult.distance_meters?.toFixed(0)}m from classroom</p>
                                </div>
                            </div>
                        )}

                        {/* Active sessions to choose from */}
                        {!loading && activeSessions.length === 0 && (
                            <div className="att2-no-active">
                                <span>🕐</span>
                                <p>No active sessions right now.</p>
                                {upcomingSessions.length > 0 && (
                                    <p className="att2-next-hint">
                                        Next: <strong>{upcomingSessions[0].class?.name}</strong> at {fmt(upcomingSessions[0].starts_at)}
                                    </p>
                                )}
                                <button className="att2-tab-switch-btn" onClick={() => setActiveTab('upcoming')}>
                                    View Schedule →
                                </button>
                            </div>
                        )}

                        {!loading && activeSessions.map((s) => {
                            const marked = alreadyMarked(s.id);
                            return (
                                <div
                                    key={s.id}
                                    className={`att2-session-option ${selectedSession?.id === s.id ? 'selected' : ''} ${marked ? 'done' : ''}`}
                                    onClick={() => !marked && setSelectedSession(s)}
                                >
                                    <div className="att2-so-left">
                                        <div className="att2-so-live-dot" />
                                        <div>
                                            <p className="att2-so-room">{s.room_name}</p>
                                            <p className="att2-so-name">{s.class?.name} · {s.class?.course_code}</p>
                                            <p className="att2-so-time">{fmt(s.starts_at)} – {fmt(s.ends_at)}</p>
                                        </div>
                                    </div>
                                    {marked
                                        ? <span className="att2-marked-badge">✓ Marked</span>
                                        : <span className="att2-live-badge">LIVE</span>
                                    }
                                </div>
                            );
                        })}

                        {/* GPS step */}
                        {selectedSession && !alreadyMarked(selectedSession.id) && (
                            <div className="att2-card">
                                <p className="att2-card-title"><span className="att2-step">1</span> Get Location</p>
                                {gpsState === GPS_STATE.READY && gpsCoords && (
                                    <div className="att2-gps-ok">
                                        <span className="att2-gps-dot" />
                                        <div>
                                            <p className="att2-gps-coords">{gpsCoords.lat.toFixed(6)}, {gpsCoords.lon.toFixed(6)}</p>
                                            <p className="att2-gps-acc">Accuracy: ±{gpsCoords.accuracy}m</p>
                                        </div>
                                    </div>
                                )}
                                {gpsState === GPS_STATE.ERROR && (
                                    <div className="att2-error-box">{gpsError}</div>
                                )}
                                <button
                                    className={`att2-gps-btn ${gpsState === GPS_STATE.FETCHING ? 'loading' : ''}`}
                                    onClick={fetchGps}
                                    disabled={gpsState === GPS_STATE.FETCHING}
                                >
                                    {gpsState === GPS_STATE.FETCHING
                                        ? <><span className="login-spinner" /> Fetching…</>
                                        : gpsState === GPS_STATE.READY ? '🔄 Refresh' : '📍 Get My Location'}
                                </button>
                            </div>
                        )}

                        {/* Submit */}
                        {selectedSession && !alreadyMarked(selectedSession.id) && (
                            <div className="att2-card">
                                <p className="att2-card-title"><span className="att2-step">2</span> Confirm</p>
                                <p className="att2-hint">
                                    Must be within {selectedSession.radius_meters ?? '—'}m of {selectedSession.room_name}
                                </p>
                                {!canMark && (
                                    <div className="att2-warn">
                                        {selectedSession.status === 'upcoming'
                                            ? `⏰ Opens at ${fmt(selectedSession.starts_at)}`
                                            : '⛔ Session ended'}
                                    </div>
                                )}
                                {markError && <div className="att2-error-box">⚠ {markError}</div>}
                                <button
                                    className={`att2-mark-btn ${marking ? 'loading' : ''}`}
                                    onClick={handleMark}
                                    disabled={marking || gpsState !== GPS_STATE.READY || !canMark}
                                >
                                    {marking
                                        ? <><span className="login-spinner" /> Marking…</>
                                        : '✅ Mark My Attendance'}
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* ══════════ TAB: SCHEDULE ══════════ */}
                {activeTab === 'upcoming' && (
                    <div className="att2-schedule">
                        {loading && <div className="att2-loading">Loading schedule…</div>}

                        {!loading && [...activeSessions, ...upcomingSessions].length === 0 && (
                            <div className="att2-empty"><span>📅</span><p>No upcoming sessions found.</p></div>
                        )}

                        {!loading && [...activeSessions, ...upcomingSessions].map((s) => {
                            const marked = alreadyMarked(s.id);
                            return (
                                <div key={s.id} className={`att2-sched-card ${s.status}`}>
                                    <div className="att2-sched-date">
                                        <span className="att2-sched-day">{new Date(s.starts_at).toLocaleDateString([], { day: 'numeric' })}</span>
                                        <span className="att2-sched-mon">{new Date(s.starts_at).toLocaleDateString([], { month: 'short' })}</span>
                                    </div>
                                    <div className="att2-sched-body">
                                        <p className="att2-sched-course">{s.class?.name}</p>
                                        <p className="att2-sched-meta">{s.room_name} · {fmt(s.starts_at)}–{fmt(s.ends_at)}</p>
                                        <p className="att2-sched-code">{s.class?.course_code}</p>
                                    </div>
                                    <div className="att2-sched-right">
                                        {s.status === 'active' && !marked && (
                                            <button
                                                className="att2-sched-mark-btn"
                                                onClick={() => { setSelectedSession(s); setActiveTab('mark'); }}
                                            >Mark</button>
                                        )}
                                        {marked && <span className="att2-sched-done">✓</span>}
                                        {s.status === 'upcoming' && <span className="att2-sched-badge">Soon</span>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ══════════ TAB: PAST SESSIONS ══════════ */}
                {activeTab === 'past' && (
                    <div className="att2-schedule">
                        {loading && <div className="att2-loading">Loading…</div>}
                        {!loading && pastSessions.length === 0 && (
                            <div className="att2-empty"><span>📂</span><p>No past sessions yet.</p></div>
                        )}
                        {!loading && pastSessions.map((s) => {
                            const marked = alreadyMarked(s.id);
                            return (
                                <div key={s.id} className={`att2-sched-card ended ${marked ? 'attended' : 'missed'}`}>
                                    <div className="att2-sched-date">
                                        <span className="att2-sched-day">{new Date(s.starts_at).toLocaleDateString([], { day: 'numeric' })}</span>
                                        <span className="att2-sched-mon">{new Date(s.starts_at).toLocaleDateString([], { month: 'short' })}</span>
                                    </div>
                                    <div className="att2-sched-body">
                                        <p className="att2-sched-course">{s.class?.name}</p>
                                        <p className="att2-sched-meta">{s.room_name} · {fmt(s.starts_at)}</p>
                                    </div>
                                    <div className="att2-sched-right">
                                        {marked
                                            ? <span className="att2-sched-done">✓ Present</span>
                                            : <span className="att2-sched-absent">✗ Absent</span>
                                        }
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

export default Attendance;