import React from 'react';
import { NavLink } from 'react-router-dom';

const BottomNav = () => {
    return (
        <nav className="bottom-nav">
            <NavLink to="/" style={({ isActive }) => ({
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
                textDecoration: 'none', color: isActive ? '#2b59ff' : '#9ca3af',
                fontSize: '0.9rem', fontWeight: 700
            })}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span>Home</span>
            </NavLink>

            <NavLink to="/leads" style={({ isActive }) => ({
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
                textDecoration: 'none', color: isActive ? '#2b59ff' : '#9ca3af',
                fontSize: '0.9rem', fontWeight: 700
            })}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span>Leads</span>
            </NavLink>

            <NavLink to="/schedule" style={({ isActive }) => ({
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
                textDecoration: 'none', color: isActive ? '#2b59ff' : '#9ca3af',
                fontSize: '0.9rem', fontWeight: 700
            })}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>Schedule</span>
            </NavLink>

            <NavLink to="/settings" style={({ isActive }) => ({
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
                textDecoration: 'none', color: isActive ? '#2b59ff' : '#9ca3af',
                fontSize: '0.9rem', fontWeight: 700
            })}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="7" r="4"></circle>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                </svg>
                <span>Profile</span>
            </NavLink>
        </nav>
    );
};

export default BottomNav;
