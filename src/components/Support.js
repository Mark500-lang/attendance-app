import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoIosArrowBack } from 'react-icons/io';
import { useAuth } from '../context/AuthContext';
import { useStatusBar } from '../hooks/useStatusBar';
import './Dashboard.css';
import './Profile.css';
import './EditProfile.css';

const SUPPORT_TOPICS = [
    'Attendance not recorded',
    'GPS location issue',
    'Wrong session shown',
    'Account access problem',
    'Other',
];

const Support = () => {
    useStatusBar('dark', '#1A1341');
    const navigate = useNavigate();
    const { user }  = useAuth();

    const [form, setForm] = useState({ topic: '', message: '' });
    const [sent,  setSent]  = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setError('');
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // For now this is a UI-only form — you can wire it to an email
    // API or a dedicated support endpoint in a later sprint.
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.topic) { setError('Please select a topic.'); return; }
        if (!form.message.trim()) { setError('Please describe your issue.'); return; }
        setSent(true);
    };

    return (
        <div className="standalone-page">
            <div className="header">
                <div className="header-left-container">
                    <IoIosArrowBack
                        className="back-button"
                        onClick={() => navigate('/profile')}
                        aria-label="Go back"
                        color="#ffffff"
                    />
                    <h1 className="header-title">Request Support</h1>
                </div>
            </div>

            <div className="content prof-content">
                {sent ? (
                    <div className="support-sent">
                        <span className="support-sent-icon">📬</span>
                        <h3>Request Sent</h3>
                        <p>
                            Your support request has been submitted.
                            The academic office will respond within 1–2 working days.
                        </p>
                        <button
                            className="edit-save-btn"
                            style={{ marginTop: 24 }}
                            onClick={() => navigate('/profile')}
                        >
                            Back to Profile
                        </button>
                    </div>
                ) : (
                    <form className="edit-form" onSubmit={handleSubmit} noValidate>
                        {/* Pre-fill student info so admin knows who sent it */}
                        <div className="edit-field">
                            <label className="edit-label">Your Name</label>
                            <input
                                className="edit-input readonly"
                                value={user?.name || ''}
                                readOnly
                            />
                        </div>

                        <div className="edit-field">
                            <label className="edit-label">Registration Number</label>
                            <input
                                className="edit-input readonly"
                                value={user?.registration_number || ''}
                                readOnly
                            />
                        </div>

                        <div className="edit-field">
                            <label className="edit-label">Topic</label>
                            <select
                                name="topic"
                                className="edit-input"
                                value={form.topic}
                                onChange={handleChange}
                                style={{ cursor: 'pointer' }}
                            >
                                <option value="">Select a topic…</option>
                                {SUPPORT_TOPICS.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        <div className="edit-field">
                            <label className="edit-label">Describe your issue</label>
                            <textarea
                                name="message"
                                className="edit-input"
                                value={form.message}
                                onChange={handleChange}
                                placeholder="Please describe the issue in detail…"
                                rows={5}
                                style={{ resize: 'vertical', fontFamily: 'inherit' }}
                            />
                        </div>

                        {error && (
                            <div className="edit-error">⚠ {error}</div>
                        )}

                        <button type="submit" className="edit-save-btn">
                            Submit Request
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Support;