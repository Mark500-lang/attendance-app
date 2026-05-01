import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { RiMenu2Line } from 'react-icons/ri';
import { useStatusBar } from '../hooks/useStatusBar';
import { notificationApi } from '../api/api';
import './Dashboard.css';
import './Notifications.css';

const Notifications = () => {
    const navigate = useNavigate();
    const context  = useOutletContext();
    const toggleSidebar = context?.toggleSidebar ?? (() => {});
    useStatusBar('dark', '#1A1341');

    const [notifications, setNotifications] = useState([]);
    const [loading,       setLoading]       = useState(true);
    const [error,         setError]         = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const res = await notificationApi.list();
                setNotifications(res.data.data?.notifications || []);
            } catch (err) {
                // Notifications endpoint may not exist yet — fail gracefully
                setError('Notifications could not be loaded.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const formatTime = (iso) => {
        const d = new Date(iso);
        const now = new Date();
        const diff = Math.floor((now - d) / 60000); // minutes
        if (diff < 1)  return 'Just now';
        if (diff < 60) return `${diff}m ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
        return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
    };

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
                    <h1 className="header-title">Notifications</h1>
                </div>
            </div>

            <div className="content notif-content">
                {loading && <p className="notif-loading">Loading…</p>}

                {error && (
                    <div className="notif-error">{error}</div>
                )}

                {!loading && !error && notifications.length === 0 && (
                    <div className="notif-empty">
                        <span>🔔</span>
                        <p>No notifications yet.</p>
                    </div>
                )}

                {!loading && notifications.map((notif) => (
                    <div
                        key={notif.id}
                        className={`notif-card ${notif.read_at ? 'read' : 'unread'}`}
                    >
                        <div className="notif-dot-col">
                            {!notif.read_at && <span className="notif-dot" />}
                        </div>
                        <div className="notif-body">
                            <p className="notif-title">{notif.title}</p>
                            <p className="notif-text">{notif.body}</p>
                            <span className="notif-time">{formatTime(notif.created_at)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Notifications;