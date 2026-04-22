import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { RiMenu2Line } from "react-icons/ri";
import { IoIosNotificationsOutline } from "react-icons/io";
import './Dashboard.css';
import { useStatusBar } from '../hooks/useStatusBar';


const Dashboard = () => {
    const navigate = useNavigate();
    const context = useOutletContext();
    const toggleSidebar = context?.toggleSidebar ?? (() => {});
    useStatusBar('dark', '#1A1341');

    return (
        <div className="standalone-page">
            <div className="header">
                <div className='header-left-container'>
                    <RiMenu2Line 
                        className="back-button" 
                        onClick={toggleSidebar} 
                        aria-label="Go back" 
                        // size={34} 
                        color="rgb(255, 255, 255)" 
                    />
                    <h1 className='header-title'>
                        Dashboard
                    </h1>
                </div>
                <IoIosNotificationsOutline 
                    className="notification-icon" 
                    onClick={() => navigate('/notifications')} 
                    aria-label="View notifications"
                />
            </div>
            <div className="content">
                Welcome to the Dashboard!
            </div>
        </div>
    );
};

export default Dashboard;