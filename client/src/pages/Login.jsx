import React, { useState } from 'react';
import api from '../utils/api';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('admin@crm.com');
    const [password, setPassword] = useState('admin123');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/login', { email, password });
            const { token, user } = res.data;
            localStorage.setItem('token', token);
            
            if (user.role === 'Sales') {
                try {
                    await api.post('/attendance/checkin', { userId: user._id || user.id });
                } catch (e) {
                    console.error('Auto check-in failed:', e);
                }
            }
            
            onLogin(user);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            height: '100vh', width: '100vw', 
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3154f3 100%)',
            display: 'flex', flexDirection: 'column', 
            alignItems: 'center', justifyContent: 'center',
            padding: '20px', fontFamily: "'Outfit', sans-serif"
        }}>
            <div style={{ 
                width: '100%', maxWidth: '420px', 
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '50px 40px', borderRadius: '35px',
                boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
                textAlign: 'center'
            }}>
                <div style={{ marginBottom: '15px', fontSize: '2.5rem', fontWeight: 800 }}>
                    <span style={{ color: '#1e3a8a' }}>Canova</span>
                    <span style={{ color: '#fbbf24' }}>CRM</span>
                </div>
                <p style={{ color: '#64748b', fontWeight: 600, marginBottom: '40px' }}>Welcome back! Please enter your details.</p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px', marginLeft: '5px' }}>Email Address</label>
                        <input 
                            type="email" 
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ 
                                width: '100%', padding: '16px 20px', borderRadius: '16px', border: '2px solid #f1f5f9', 
                                background: '#f8fafc', fontSize: '1rem', fontWeight: 600, color: '#1e293b', 
                                outline: 'none', transition: '0.2s'
                            }}
                        />
                    </div>
                    
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px', marginLeft: '5px' }}>Password</label>
                        <input 
                            type="password" 
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ 
                                width: '100%', padding: '16px 20px', borderRadius: '16px', border: '2px solid #f1f5f9', 
                                background: '#f8fafc', fontSize: '1rem', fontWeight: 600, color: '#1e293b', 
                                outline: 'none', transition: '0.2s'
                            }}
                        />
                    </div>

                    {error && <div style={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: 700, background: '#fef2f2', padding: '12px', borderRadius: '12px' }}>{error}</div>}

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{ 
                            marginTop: '10px',
                            padding: '16px', borderRadius: '16px', 
                            background: 'linear-gradient(90deg, #1e3a8a 0%, #3154f3 100%)', 
                            color: '#fff', border: 'none', fontWeight: 800, fontSize: '1.1rem',
                            cursor: 'pointer', transition: '0.3s',
                            boxShadow: '0 10px 20px rgba(49, 84, 243, 0.3)'
                        }}
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                    
                    <div style={{ marginTop: '20px', fontSize: '0.9rem', color: '#94a3b8', fontWeight: 500 }}>
                        Don't have an account? <span style={{ color: '#3154f3', fontWeight: 700, cursor: 'pointer' }}>Contact Admin</span>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
