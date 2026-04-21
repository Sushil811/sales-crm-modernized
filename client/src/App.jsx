import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Leads from './pages/Leads';
import Login from './pages/Login';
import Settings from './pages/Settings';
import Schedule from './pages/Schedule';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';

function App() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (savedUser && token) {
        return JSON.parse(savedUser);
      }
    } catch (error) {
      console.error('Error parsing saved user:', error);
    }
    return null;
  });
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobile = windowWidth < 768;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <Router>
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <div className={`main-wrapper ${user.role}`}>
          <Sidebar user={user} onLogout={handleLogout} />
          <main className="content-area-main" style={{ 
            marginLeft: isMobile ? '0' : '240px',
            width: isMobile ? '100%' : 'calc(100% - 240px)',
            transition: 'margin 0.3s ease'
          }}>
            <Routes>
              <Route path="/" element={<Dashboard user={user} />} />
              <Route path="/leads" element={<Leads user={user} />} />
              <Route path="/employees" element={user.role === 'Admin' ? <Employees user={user} /> : <Navigate to="/" />} />
              <Route path="/schedule" element={user.role === 'Sales' ? <Schedule user={user} /> : <Navigate to="/" />} />
              {/* EmployeePanel functionality now integrated into Dashboard for Sales role */}
              <Route path="/settings" element={<Settings user={user} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          {user.role === 'Sales' && <BottomNav user={user} />}
        </div>
      )}
    </Router>
  );
}

export default App;
