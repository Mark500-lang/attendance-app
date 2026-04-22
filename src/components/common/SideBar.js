import React, { useState } from 'react';
import './SideBar.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { IoHomeOutline, IoGameControllerOutline, IoList, IoMailOutline, IoPower } from "react-icons/io5";
import { FaRegUser } from "react-icons/fa6";

const SideBar = ({ onItemClick, isOpen = true, onClose, enableGestures = true }) => {
    const [activeItem, setActiveItem] = useState('dashboard');
    const location = useLocation();
    const navigate = useNavigate();

    const items = [
        { id: 'dashboard', label: 'Dashboard', icon: <IoHomeOutline /> },
        { id: 'attendance', label: 'Attendance', icon: <IoGameControllerOutline /> },
        { id: 'reports', label: 'Reports', icon: <FaRegUser /> },
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
            case 'logout':
                // TODO: call logout() here once AuthContext is set up
                navigate('/login');
                break;
            default:
                navigate('/');
        }

        if (window.innerWidth <= 768) {
            onClose?.();
        }
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

            <nav className="sidebar-nav">
                {items.map((item) => (
                    <button
                        key={item.id}
                        className={`sidebar-item ${activeItem === item.id ? 'active' : ''}`}
                        onClick={() => handleItemClick(item)}
                        aria-label={item.label}
                    >
                        {item.icon && <span className="sidebar-icon">{item.icon}</span>}
                        <span className="sidebar-label">{item.label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default SideBar;