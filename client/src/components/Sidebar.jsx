import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ user, onLogout }) => {
    const isAdmin = user?.role === 'Admin';

    return (
        <div className="sidebar" style={{ 
            width: '240px', background: '#d6d6d6', padding: '35px 0', 
            height: '100vh', position: 'fixed', color: '#1a1a1a',
            display: 'flex', flexDirection: 'column',
            borderRight: '1.5px solid #ccc'
        }}>
            <div className="sidebar-logo" style={{ padding: '0 25px 50px 25px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>
                    <span style={{ color: '#000' }}>Canova</span>
                    <span style={{ color: '#3154f3' }}>CRM</span>
                </div>
            </div>
            <nav className="sidebar-nav" style={{ padding: '0 12px', flex: 1 }}>
                {(isAdmin ? [
                    { path: '/', label: 'Dashboard' },
                    { path: '/leads', label: 'Leads' },
                    { path: '/employees', label: 'Employees' },
                    { path: '/settings', label: 'Settings' }
                ] : [
                    { path: '/', label: 'Home' },
                    { path: '/leads', label: 'Leads' },
                    { path: '/schedule', label: 'Schedule' },
                    { path: '/settings', label: 'Profile' }
                ]).map((item) => (
                    <NavLink 
                        key={item.path}
                        to={item.path} 
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} 
                        style={{ 
                            display: 'flex', alignItems: 'center', padding: '14px 22px', 
                            borderRadius: '12px', textDecoration: 'none', color: '#1a1a1a',
                            marginBottom: '10px', fontWeight: 700, fontSize: '0.95rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div style={{ padding: '20px' }}>
                <button onClick={onLogout} style={{ 
                    width: '100%', padding: '14px', borderRadius: '12px', 
                    background: '#1a1a1a', border: 'none', 
                    color: '#fff', cursor: 'pointer', fontWeight: 700,
                    fontSize: '0.85rem'
                }}>
                    Logout
                </button>
            </div>

            <style>{`
                .nav-item.active {
                    background: #acacac !important;
                    color: #fff !important;
                }
                .nav-item:hover:not(.active) {
                    background: rgba(0,0,0,0.05);
                }
            `}</style>
        </div>
    );
};

export default Sidebar;
