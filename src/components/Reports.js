import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { RiMenu2Line } from 'react-icons/ri';
import { IoIosNotificationsOutline } from 'react-icons/io';
import { useStatusBar } from '../hooks/useStatusBar';
import { useAuth } from '../context/AuthContext';
import { attendanceApi } from '../api/api';
import './Dashboard.css';
import './Reports.css';

const Reports = () => {
    const navigate = useNavigate();
    const context  = useOutletContext();
    const toggleSidebar = context?.toggleSidebar ?? (() => {});
    useStatusBar('dark', '#1A1341');

    const { user, isAdmin } = useAuth();

    const [records, setRecords] = useState([]);
    const [total,   setTotal]   = useState(0);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const res = isAdmin
                    ? await attendanceApi.fullReport()
                    : await attendanceApi.myHistory();

                const data = res.data.data;
                setRecords(data.attendances || []);
                setTotal(data.total || 0);
            } catch (err) {
                setError('Failed to load attendance records.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [isAdmin]);

    const formatDate = (iso) =>
        new Date(iso).toLocaleDateString([], {
            weekday: 'short', day: 'numeric',
            month: 'short', year: 'numeric',
        });

    const formatTime = (iso) =>
        new Date(iso).toLocaleTimeString([], {
            hour: '2-digit', minute: '2-digit',
        });

    return (
        <div className="standalone-page">
            <div className="header">
                <div className="header-left-container">
                    <RiMenu2Line
                        className="back-button"
                        onClick={toggleSidebar}
                        aria-label="Open menu"
                        color="rgb(255, 255, 255)"
                    />
                    <h1 className="header-title">Reports</h1>
                </div>
                <IoIosNotificationsOutline
                    className="notification-icon"
                    onClick={() => navigate('/notifications')}
                    aria-label="View notifications"
                />
            </div>

            <div className="content rep-content">
                <div className="rep-summary">
                    <div className="rep-summary-val">{loading ? '—' : total}</div>
                    <div className="rep-summary-label">
                        {isAdmin ? 'Total Attendance Records' : 'Sessions Attended'}
                    </div>
                </div>

                {error && <div className="rep-error">{error}</div>}

                {loading && <p className="rep-loading">Loading records…</p>}

                {!loading && records.length === 0 && (
                    <div className="rep-empty">
                        <span>📋</span>
                        <p>No attendance records found.</p>
                    </div>
                )}

                {!loading && records.map((record) => (
                    <div key={record.id} className="rep-card">
                        <div className="rep-card-top">
                            <span className="rep-room">
                                {record.session?.room_name ?? '—'}
                            </span>
                            <span className="rep-time">
                                {formatTime(record.marked_at)}
                            </span>
                        </div>
                        <p className="rep-class">
                            {record.session?.class?.name ?? '—'} ·{' '}
                            {record.session?.class?.course_code ?? '—'}
                        </p>
                        {/* Admin view shows student info */}
                        {isAdmin && record.student && (
                            <p className="rep-student">
                                👤 {record.student.name} · {record.student.registration_number}
                            </p>
                        )}
                        <div className="rep-card-bottom">
                            <span className="rep-date">{formatDate(record.marked_at)}</span>
                            {record.distance_meters != null && (
                                <span className="rep-dist">
                                    📍 {Number(record.distance_meters).toFixed(0)}m from room
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Reports;