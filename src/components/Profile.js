import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { useAuth } from '../context/AuthContext';
import { useStatusBar } from '../hooks/useStatusBar';
import './Profile.css';

const Profile = () => {
    useStatusBar('dark', '#1A1341');
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    // Build initials for the avatar
    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
        : '?';

    return (
        <div className="standalone-page">

            {/* ── Header — same structure as Dashboard ── */}
            <div className="header">
                <div className="header-left-container">
                    <IoIosArrowBack
                        className="back-button"
                        onClick={() => navigate(-1)}
                        aria-label="Go back"
                        color="rgb(255, 255, 255)"
                    />
                    <h1 className="header-title">My Profile</h1>
                </div>
            </div>

            <div className="content prof-content">

                {/* ── User info card — mirrors the Account template ── */}
                <div className="prof-user-card">
                    <div className="prof-avatar">
                        {initials}
                    </div>
                    <div className="prof-user-details">
                        <h3 className="prof-user-name">{user?.name ?? '—'}</h3>
                        <p className="prof-user-reg">{user?.registration_number ?? '—'}</p>
                        {user?.email && (
                            <p className="prof-user-email">{user.email}</p>
                        )}
                        <span className={`prof-role-badge ${user?.role}`}>
                            {user?.role}
                        </span>
                    </div>
                </div>

                {/* ── Account list — exact pattern from the template ── */}
                <div className="prof-list">

                    <div
                        className="prof-item"
                        onClick={() => navigate('/profile/edit')}
                        role="button"
                        tabIndex={0}
                    >
                        <div className="prof-item-left">
                            <span className="prof-item-icon">✏️</span>
                            <div>
                                <h4>Edit Profile</h4>
                                <p>Update your name and email</p>
                            </div>
                        </div>
                        <IoIosArrowForward className="prof-chevron" />
                    </div>

                    <div
                        className="prof-item"
                        onClick={() => navigate('/profile/password')}
                        role="button"
                        tabIndex={0}
                    >
                        <div className="prof-item-left">
                            <span className="prof-item-icon">🔒</span>
                            <div>
                                <h4>Change Password</h4>
                                <p>Secure your account</p>
                            </div>
                        </div>
                        <IoIosArrowForward className="prof-chevron" />
                    </div>

                    <div
                        className="prof-item"
                        onClick={() => navigate('/profile/support')}
                        role="button"
                        tabIndex={0}
                    >
                        <div className="prof-item-left">
                            <span className="prof-item-icon">🎓</span>
                            <div>
                                <h4>Request Support</h4>
                                <p>Contact the academic office</p>
                            </div>
                        </div>
                        <IoIosArrowForward className="prof-chevron" />
                    </div>

                    {/* ── Logout — separated from the list above ── */}
                    <div
                        className="prof-item prof-item-logout"
                        onClick={() => setShowLogoutConfirm(true)}
                        role="button"
                        tabIndex={0}
                    >
                        <div className="prof-item-left">
                            <span className="prof-item-icon">🚪</span>
                            <div>
                                <h4>Logout</h4>
                                <p>Sign out of your account</p>
                            </div>
                        </div>
                        <IoIosArrowForward className="prof-chevron" />
                    </div>
                </div>
            </div>

            {/* ── Logout confirmation modal ── */}
            {showLogoutConfirm && (
                <div
                    className="prof-modal-overlay"
                    onClick={() => setShowLogoutConfirm(false)}
                >
                    <div
                        className="prof-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="prof-modal-title">Sign Out?</h3>
                        <p className="prof-modal-body">
                            You'll need to enter your registration number
                            and password to sign back in.
                        </p>
                        <div className="prof-modal-actions">
                            <button
                                className="prof-modal-btn cancel"
                                onClick={() => setShowLogoutConfirm(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="prof-modal-btn confirm"
                                onClick={handleLogout}
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;