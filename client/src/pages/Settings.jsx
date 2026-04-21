import React, { useState } from 'react';
import api from '../utils/api';

const Settings = ({ user }) => {
    const [profile, setProfile] = useState({
        firstName: user?.firstName || user?.name?.split(' ')[0] || '',
        lastName: user?.lastName || user?.name?.split(' ')[1] || '',
        email: user?.email || '',
        password: '',
        confirmPassword: ''
    });

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            if (profile.password && profile.password !== profile.confirmPassword) {
                return alert('Passwords do not match');
            }
            const res = await api.patch('/users/profile', { 
                userId: user._id,
                firstName: profile.firstName,
                lastName: profile.lastName,
                email: profile.email,
                password: profile.password || undefined
            });
            alert('Profile updated successfully!');
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const updatedUser = { ...storedUser, ...res.data };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            window.location.reload(); 
        } catch (err) {
            alert(err.response?.data?.message || 'Update failed');
        }
    };

    const handleLogout = () => {
        if (window.confirm('Logout?')) {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
    };

    if (user.role === 'Admin') {
        return (
            <div style={{ background: '#fff', minHeight: '100vh', padding: '50px 0', fontFamily: "'Outfit', sans-serif" }}>
                <div style={{ padding: '0 40px', marginBottom: '35px' }}>
                     <div style={{ fontSize: '1rem', fontWeight: 600, color: '#666', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Home <span style={{ opacity: 0.5 }}>›</span> Settings
                    </div>
                </div>

                <div style={{ padding: '0 40px' }}>
                    <div style={{ 
                        maxWidth: '1200px', 
                        border: '1.5px solid #eee', 
                        borderRadius: '20px', 
                        padding: '40px 40px 120px 40px',
                        position: 'relative',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                    }}>
                        {/* Tabs */}
                        <div style={{ borderBottom: '1.5px solid #eee', marginBottom: '45px', display: 'flex', gap: '40px' }}>
                            <div style={{ 
                                padding: '0 0 15px 0', 
                                color: '#1a1a1a', 
                                fontWeight: 800, 
                                borderBottom: '3.5px solid #666',
                                fontSize: '1rem',
                                cursor: 'pointer'
                            }}>
                                Edit Profile
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleUpdate} style={{ maxWidth: '600px', display: 'grid', gap: '30px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '1rem', fontWeight: 700, color: '#666', marginBottom: '12px' }}>First name</label>
                                    <input 
                                        style={{ width: '100%', padding: '16px 22px', borderRadius: '15px', border: '1.5px solid #666', outline: 'none', fontWeight: 600, fontSize: '1rem' }} 
                                        value={profile.firstName} 
                                        onChange={e => setProfile({...profile, firstName: e.target.value})} 
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '1rem', fontWeight: 700, color: '#666', marginBottom: '12px' }}>Last name</label>
                                    <input 
                                        style={{ width: '100%', padding: '16px 22px', borderRadius: '15px', border: '1.5px solid #666', outline: 'none', fontWeight: 600, fontSize: '1rem' }} 
                                        value={profile.lastName} 
                                        onChange={e => setProfile({...profile, lastName: e.target.value})} 
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '1rem', fontWeight: 700, color: '#666', marginBottom: '12px' }}>Email</label>
                                    <input 
                                        style={{ width: '100%', padding: '16px 22px', borderRadius: '15px', border: '1.5px solid #666', outline: 'none', fontWeight: 600, fontSize: '1rem' }} 
                                        value={profile.email} 
                                        onChange={e => setProfile({...profile, email: e.target.value})} 
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '1rem', fontWeight: 700, color: '#666', marginBottom: '12px' }}>Password</label>
                                    <input 
                                        type="password"
                                        style={{ width: '100%', padding: '16px 22px', borderRadius: '15px', border: '1.5px solid #666', outline: 'none', fontWeight: 600, fontSize: '1rem' }} 
                                        placeholder="************"
                                        value={profile.password} 
                                        onChange={e => setProfile({...profile, password: e.target.value})} 
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '1rem', fontWeight: 700, color: '#666', marginBottom: '12px' }}>Confirm Password</label>
                                    <input 
                                        type="password"
                                        style={{ width: '100%', padding: '16px 22px', borderRadius: '15px', border: '1.5px solid #666', outline: 'none', fontWeight: 600, fontSize: '1rem' }} 
                                        placeholder="************"
                                        value={profile.confirmPassword} 
                                        onChange={e => setProfile({...profile, confirmPassword: e.target.value})} 
                                    />
                                </div>
                            </div>

                            {/* Save Button */}
                            <button 
                                type="submit" 
                                style={{ 
                                    position: 'absolute', 
                                    bottom: '40px', 
                                    right: '40px', 
                                    padding: '16px 80px', 
                                    borderRadius: '18px', 
                                    background: '#dcdde1', 
                                    color: '#636e72', 
                                    border: 'none', 
                                    fontWeight: 800, 
                                    fontSize: '1.1rem', 
                                    cursor: 'pointer',
                                    transition: 'background 0.2s'
                                }}
                            >
                                Save
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: '#f8f9fd', minHeight: '100vh', paddingBottom: '100px', fontFamily: "'Outfit', sans-serif" }}>
            
            {/* Blue Header Section */}
            <div className="profile-header-modern" style={{ 
                padding: '40px 25px 60px 25px', 
                borderRadius: '0 0 40px 40px', 
                background: 'linear-gradient(180deg, #2b59ff 0%, #1a45ff 100%)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(26, 69, 255, 0.15)'
            }}>
                {/* Decorative Circles */}
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}></div>
                <div style={{ position: 'absolute', bottom: '-40px', left: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}></div>

                <div style={{ marginBottom: '35px', display: 'flex', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>Canova</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f3e833', letterSpacing: '-0.5px' }}>CRM</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative', zIndex: 1 }}>
                    <div onClick={() => window.history.back()} style={{ color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', margin: 0 }}>Profile</h2>
                </div>
            </div>

            <div style={{ padding: '0 25px', marginTop: '-30px', position: 'relative', zIndex: 2 }}>
                <form onSubmit={handleUpdate} style={{ background: '#fff', padding: '40px 25px', borderRadius: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' }}>
                    
                    {/* Avatar Placeholder */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '35px' }}>
                        <div style={{ 
                            width: '90px', 
                            height: '90px', 
                            borderRadius: '25px', 
                            background: '#f0f3ff', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            border: '2px solid #eef1ff'
                        }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2b59ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: '25px', marginBottom: '40px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, color: '#888', marginBottom: '10px', marginLeft: '5px' }}>First name</label>
                            <input 
                                style={{ width: '100%', padding: '18px 25px', borderRadius: '20px', border: '1.5px solid #f0f0f0', outline: 'none', fontWeight: 600, background: '#fcfcfc', fontSize: '1rem', color: '#1a1a1a', transition: 'border-color 0.2s' }} 
                                value={profile.firstName} 
                                onChange={e => setProfile({...profile, firstName: e.target.value})} 
                                onFocus={(e) => e.target.style.borderColor = '#2b59ff'}
                                onBlur={(e) => e.target.style.borderColor = '#f0f0f0'}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, color: '#888', marginBottom: '10px', marginLeft: '5px' }}>Last name</label>
                            <input 
                                style={{ width: '100%', padding: '18px 25px', borderRadius: '20px', border: '1.5px solid #f0f0f0', outline: 'none', fontWeight: 600, background: '#fcfcfc', fontSize: '1rem', color: '#1a1a1a', transition: 'border-color 0.2s' }} 
                                value={profile.lastName} 
                                onChange={e => setProfile({...profile, lastName: e.target.value})} 
                                onFocus={(e) => e.target.style.borderColor = '#2b59ff'}
                                onBlur={(e) => e.target.style.borderColor = '#f0f0f0'}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, color: '#888', marginBottom: '10px', marginLeft: '5px' }}>Email Address</label>
                            <input 
                                style={{ width: '100%', padding: '18px 25px', borderRadius: '20px', border: '1.5px solid #f0f0f0', outline: 'none', fontWeight: 600, background: '#fcfcfc', fontSize: '1rem', color: '#1a1a1a', transition: 'border-color 0.2s' }} 
                                value={profile.email} 
                                onChange={e => setProfile({...profile, email: e.target.value})} 
                                onFocus={(e) => e.target.style.borderColor = '#2b59ff'}
                                onBlur={(e) => e.target.style.borderColor = '#f0f0f0'}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, color: '#888', marginBottom: '10px', marginLeft: '5px' }}>New Password</label>
                            <input 
                                type="password"
                                style={{ width: '100%', padding: '18px 25px', borderRadius: '20px', border: '1.5px solid #f0f0f0', outline: 'none', fontWeight: 600, background: '#fcfcfc', fontSize: '1rem', color: '#1a1a1a', transition: 'border-color 0.2s' }} 
                                placeholder="Leave blank to keep current"
                                value={profile.password} 
                                onChange={e => setProfile({...profile, password: e.target.value})} 
                                onFocus={(e) => e.target.style.borderColor = '#2b59ff'}
                                onBlur={(e) => e.target.style.borderColor = '#f0f0f0'}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button 
                            type="submit" 
                            style={{ 
                                flex: 1, padding: '18px', borderRadius: '18px', 
                                background: '#2b59ff', color: '#fff', border: 'none', 
                                fontWeight: 650, fontSize: '1rem', cursor: 'pointer',
                                transition: 'transform 0.2s, background 0.2s',
                                boxShadow: '0 8px 15px rgba(43, 89, 255, 0.25)'
                            }}
                            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                        >
                            Save Changes
                        </button>
                        <button 
                            type="button" 
                            onClick={handleLogout}
                            style={{ 
                                flex: 1, padding: '18px', borderRadius: '18px', 
                                background: '#f2412b', color: '#fff', border: 'none', 
                                fontWeight: 650, fontSize: '1rem', cursor: 'pointer',
                                transition: 'transform 0.2s, background 0.2s',
                                boxShadow: '0 8px 15px rgba(242, 65, 43, 0.25)'
                            }}
                            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                        >
                            Logout
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;
