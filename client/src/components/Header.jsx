import React, { useState } from 'react';

const Header = ({ title = "Welcome back", user }) => {
    const [showDropdown, setShowDropdown] = useState(false);

    const handleLogout = () => {
        localStorage.clear();
        window.location.reload();
    };

    return (
        <header className="top-header">
            <div className="header-left">
                <div className="greeting">{title}{user ? `, ${user.name}` : ''}</div>
            </div>
            <div className="header-right">
                <input type="text" placeholder="Search..." className="search-bar-top" />
                <div style={{ fontSize: '1.2rem', cursor: 'pointer' }}>🔔</div>
                <div className="profile-section" style={{ position: 'relative' }} onClick={() => setShowDropdown(!showDropdown)}>
                    <div className="avatar">{(user?.name || 'U').charAt(0)}</div>
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.name || 'Guest User'}</div>
                        <div style={{ fontSize: '0.7rem', color: '#7f8c8d' }}>{user?.role || 'User'}</div>
                    </div>
                    <div style={{ fontSize: '0.7rem' }}>▼</div>
                    
                    {showDropdown && (
                        <div style={{ 
                            position: 'absolute', top: '50px', right: 0, 
                            background: 'white', border: '1px solid #ddd', 
                            borderRadius: '8px', padding: '10px 0', 
                            width: '150px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            zIndex: 1000
                        }}>
                            <div className="dropdown-item" onClick={() => window.location.href='/settings'} style={{ padding: '8px 15px', cursor: 'pointer' }}>Settings</div>
                            <div className="dropdown-item" onClick={handleLogout} style={{ padding: '8px 15px', cursor: 'pointer' }}>Sign Out</div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
