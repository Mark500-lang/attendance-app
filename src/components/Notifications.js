import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoIosArrowBack, IoIosNotificationsOutline } from "react-icons/io";
import './Notifications.css';
import { useStatusBar } from '../hooks/useStatusBar';

const Notifications = () => {
    const navigate = useNavigate();
    useStatusBar('dark', '#1A1341');

    const handleBack = () => {
        navigate('/');
    };

    return (
        <div className="standalone-page">
            <div className="header">
                <div className='header-left-container'>
                    <IoIosArrowBack 
                        className="back-button" 
                        onClick={handleBack} 
                        aria-label="Go back" 
                    />
                    <h1 className='header-title'>
                        Notifications
                    </h1>
                </div>
                <IoIosNotificationsOutline 
                    className="notification-icon" 
                    onClick={() => navigate('/notifications')} 
                    aria-label="View notifications"
                />
            </div>
        </div>
    );
};

export default Notifications;