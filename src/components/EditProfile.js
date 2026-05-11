import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoIosArrowBack } from 'react-icons/io';
import { useAuth } from '../context/AuthContext';
import { useStatusBar } from '../hooks/useStatusBar';
import { authApi } from '../api/api';
import './Dashboard.css';
import './Profile.css';
import './EditProfile.css';

const EditProfile = () => {
    useStatusBar('dark', '#1A1341');
    const navigate = useNavigate();
    const { user } = useAuth();

    const [form, setForm] = useState({
        name:  user?.name  || '',
        email: user?.email || '',
    });
    const [saving,   setSaving]   = useState(false);
    const [success,  setSuccess]  = useState('');
    const [error,    setError]    = useState('');

    const handleChange = (e) => {
        setSuccess('');
        setError('');
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) {
            setError('Name cannot be empty.');
            return;
        }
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            await authApi.updateProfile({
                name:  form.name.trim(),
                email: form.email.trim() || null,
            });
            setSuccess('Profile updated successfully.');
        } catch (err) {
            setError(
                err.response?.data?.message || 'Failed to update profile.'
            );
        } finally {
            setSaving(false);
        }
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
                    <h1 className="header-title">Edit Profile</h1>
                </div>
            </div>

            <div className="content prof-content">
                <form className="edit-form" onSubmit={handleSave} noValidate>
                    <div className="edit-field">
                        <label className="edit-label">Full Name</label>
                        <input
                            name="name"
                            type="text"
                            className="edit-input"
                            value={form.name}
                            onChange={handleChange}
                            disabled={saving}
                            placeholder="Your full name"
                        />
                    </div>

                    <div className="edit-field">
                        <label className="edit-label">Email (optional)</label>
                        <input
                            name="email"
                            type="email"
                            className="edit-input"
                            value={form.email}
                            onChange={handleChange}
                            disabled={saving}
                            placeholder="your@email.com"
                        />
                    </div>

                    {/* Registration number is read-only — set by institution */}
                    <div className="edit-field">
                        <label className="edit-label">Registration Number</label>
                        <input
                            type="text"
                            className="edit-input readonly"
                            value={user?.registration_number || ''}
                            readOnly
                        />
                        <span className="edit-hint">
                            Registration number cannot be changed.
                            Contact your department if there is an error.
                        </span>
                    </div>

                    {success && (
                        <div className="edit-success">✅ {success}</div>
                    )}
                    {error && (
                        <div className="edit-error">⚠ {error}</div>
                    )}

                    <button
                        type="submit"
                        className={`edit-save-btn ${saving ? 'loading' : ''}`}
                        disabled={saving}
                    >
                        {saving
                            ? <><span className="login-spinner" /> Saving…</>
                            : 'Save Changes'
                        }
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditProfile;