import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    IoHomeOutline, IoHome, IoBarChart, IoBarChartOutline
} from 'react-icons/io5';
import { PiNotebookFill, PiNotebookLight } from "react-icons/pi";

import './BottomNav.css';

const NAV_ITEMS = [
    { id: 'dashboard',  path: '/',           label: 'Home',    icon: <IoHomeOutline />,            iconFill: <IoHome /> },
    { id: 'attendance', path: '/attendance', label: 'Attend',  icon: <PiNotebookLight />,  iconFill: <PiNotebookFill /> },
    { id: 'reports',    path: '/reports',    label: 'Reports', icon: <IoBarChartOutline />,             iconFill: <IoBarChart /> },
];

const BottomNav = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const getActiveId = () => {
        const p = location.pathname;
        if (p === '/')           return 'dashboard';
        if (p === '/attendance') return 'attendance';
        if (p === '/reports')    return 'reports';
        return 'dashboard';
    };
    const activeId = getActiveId();

    const handleNavClick = (item, e) => {
        const btn    = e.currentTarget;
        const ripple = document.createElement('span');
        const rect   = btn.getBoundingClientRect();
        const size   = Math.max(rect.width, rect.height);
        ripple.className  = 'nav-ripple';
        ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px`;
        btn.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
        navigate(item.path);
    };

    return (
        <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => {
                const isActive = activeId === item.id;
                return (
                    <button
                        key={item.id}
                        className={`nav-item ${isActive ? 'active' : ''}`}
                        onClick={(e) => handleNavClick(item, e)}
                        aria-label={item.label}
                        aria-current={isActive ? 'page' : undefined}
                    >
                        <span className="nav-pill" aria-hidden="true" />
                        <span className="nav-icon" aria-hidden="true">
                            {isActive ? item.iconFill : item.icon}
                        </span>
                        <span className="nav-label">{item.label}</span>
                    </button>
                );
            })}
        </nav>
    );
};

export default BottomNav;