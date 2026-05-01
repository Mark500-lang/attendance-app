import React, { useState } from 'react';
import './SideBar.css';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    IoHomeOutline,
    IoGameControllerOutline,
    IoList,
    IoMailOutline,
    IoPower,
} from 'react-icons/io5';
import { FaRegUser } from 'react-icons/fa6';
import { useAuth } from '../../context/AuthContext';

const SideBar = ({ onItemClick, isOpen = true, onClose, enableGestures = true }) => {
    const [activeItem, setActiveItem] = useState('dashboard');
    const location  = useLocation();
    const navigate  = useNavigate();

    // ── Wire up the logout TODO from the original ──────────────────────
    const { logout, user } = useAuth();

    const items = [
        { id: 'dashboard',     label: 'Dashboard',     icon: <IoHomeOutline /> },
        { id: 'attendance',    label: 'Attendance',    icon: <IoGameControllerOutline /> },
        { id: 'reports',       label: 'Reports',       icon: <FaRegUser /> },
        { id: 'notifications', label: 'Notifications', icon: <IoMailOutline /> },
    ];

    const handleItemClick = async (item) => {
        setActiveItem(item.id);
        onItemClick?.(item);

        switch (item.id) {
            case 'dashboard':
                navigate('/');
                break;
            case 'attendance':
                navigate('/attendance');
                break;
            case 'reports':
                navigate('/reports');
                break;
            case 'notifications':
                navigate('/notifications');
                break;
            default:
                navigate('/');
        }

        if (window.innerWidth <= 768) {
            onClose?.();
        }
    };

    const handleLogout = async () => {
        // Call the real logout from AuthContext — clears token + redirects
        await logout();
        navigate('/login', { replace: true });
    };

    const handleCloseClick = (e) => {
        e.stopPropagation();
        onClose?.();
    };

    return (
        <div className={`SideBar-container ${isOpen ? 'open' : 'closed'}`}>
            <button
                className="sidebar-close-btn"
                onClick={handleCloseClick}
                aria-label="Close menu"
            >
                ✕
            </button>

            {/* ── User info block ── */}
            {user && (
                <div className="sidebar-user">
                    <div className="sidebar-user-avatar">
                        {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="sidebar-user-info">
                        <span className="sidebar-user-name">{user.name}</span>
                        <span className="sidebar-user-reg">{user.registration_number}</span>
                        <span className={`sidebar-user-role ${user.role}`}>{user.role}</span>
                    </div>
                </div>
            )}

            <nav className="sidebar-nav">
                {items.map((item) => (
                    <button
                        key={item.id}
                        className={`sidebar-item ${activeItem === item.id ? 'active' : ''}`}
                        onClick={() => handleItemClick(item)}
                        aria-label={item.label}
                    >
                        {item.icon && (
                            <span className="sidebar-icon">{item.icon}</span>
                        )}
                        <span className="sidebar-label">{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* ── Logout at the bottom, separated from nav ── */}
            <div className="sidebar-footer">
                <button
                    className="sidebar-item sidebar-logout"
                    onClick={handleLogout}
                    aria-label="Logout"
                >
                    <span className="sidebar-icon"><IoPower /></span>
                    <span className="sidebar-label">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default SideBar;