import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../utils/api';
import EmployeePanel from './EmployeePanel';

const Dashboard = ({ user }) => {
    const [stats, setStats] = useState({});
    const [activities, setActivities] = useState([]);
    const [salesStaff, setSalesStaff] = useState([]);
    const [staffSearch, setStaffSearch] = useState('');

    const fetchAttendance = useCallback(async () => {
        try {
            const uid = user?._id || user?.id;
            if (!uid) return null;
            const res = await api.get(`/attendance/dashboard-summary/${uid}`);
            // setAttendance(res.data); // Remove or comment out if unused in Admin view
            return res.data;
        } catch (error) { 
            console.error('Attendance Fetch Error:', error); 
            return null;
        }
    }, [user]);

    const fetchData = useCallback(async () => {
        try {
            const uid = user?._id || user?.id;
            if (!uid) return;
            const [statsRes, actRes, staffRes] = await Promise.all([
                api.get('/dashboard/stats', { params: { userId: uid, role: user.role } }),
                api.get('/dashboard/activities'),
                api.get('/employees')
            ]);
            setStats(statsRes.data);
            setActivities(actRes.data);
            setSalesStaff(staffRes.data.employees || []);
            
            if (user.role === 'Sales') {
                await fetchAttendance();
            }
        } catch (error) { 
            console.error('Data Fetch Error:', error); 
        }
    }, [user, fetchAttendance]);

    useEffect(() => {
        let mounted = true;
        const init = async () => {
            const uid = user?._id || user?.id;
            if (!uid) return;
            await fetchData();
        };
        init();
        return () => {
            mounted = false;
        };
    }, [user, fetchData, fetchAttendance]);

    const chartData = [
        { name: 'Sat', rate: 25 }, { name: 'Sun', rate: 45 }, { name: 'Mon', rate: 28 },
        { name: 'Tue', rate: 15 }, { name: 'Wed', rate: 10 }, { name: 'Thu', rate: 25 },
        { name: 'Fri', rate: 75 }, { name: 'Sat', rate: 60 }, { name: 'Sun', rate: 42 },
        { name: 'Mon', rate: 20 }, { name: 'Tue', rate: 30 }, { name: 'Wed', rate: 28 },
        { name: 'Thu', rate: 10 }, { name: 'Fri', rate: 10 }
    ];

    if (user.role === 'Sales') {
        return <EmployeePanel user={user} />;
    }

    return (
        <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '0 0 50px 0', fontFamily: "'Outfit', sans-serif" }}>
            {/* Top Search Bar */}
            <div style={{ background: '#fff', padding: '20px 50px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
                    <input 
                        placeholder="Search here..."
                        style={{ width: '100%', padding: '14px 20px 14px 50px', borderRadius: '15px', background: '#f0f0f0', border: 'none', fontSize: '0.95rem', outline: 'none', fontWeight: 500, color: '#444' }}
                        value={staffSearch}
                        onChange={e => setStaffSearch(e.target.value)}
                    />
                    <div style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, display: 'flex', alignItems: 'center' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>
                </div>
            </div>

            <div style={{ padding: '35px 50px' }}>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#999', marginBottom: '35px' }}>
                    Home <span style={{ opacity: 0.4, margin: '0 10px' }}>›</span> <span style={{ color: '#1a1a1a' }}>Dashboard</span>
                </div>

                {/* KPI Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
                    {[
                        { label: 'Unassigned Leads', val: stats.unassignedLeads || 0 },
                        { label: 'Assigned This Week', val: stats.assignedThisWeek || 0 },
                        { label: 'Active Salespeople', val: stats.activeSalesPeople || 0 },
                        { label: 'Conversion Rate', val: `${stats.conversionRate || 0}%` }
                    ].map((kpi, idx) => (
                        <div key={idx} style={{ background: '#fff', padding: '25px', borderRadius: '15px', border: '1px solid #ddd' }}>
                            <div style={{ fontSize: '0.9rem', color: '#888', fontWeight: 600, marginBottom: '10px' }}>{kpi.label}</div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1a1a1a' }}>{kpi.val}</div>
                        </div>
                    ))}
                </div>

                {/* Chart and Activity */}
                <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr', gap: '30px', marginBottom: '40px' }}>
                    <div style={{ background: '#fff', padding: '30px', borderRadius: '20px', border: '1px solid #ddd' }}>
                        <h3 style={{ margin: '0 0 25px 0', fontSize: '1.2rem', fontWeight: 800 }}>Sale Analytics</h3>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid vertical={false} stroke="#eee" />
                                    <XAxis dataKey="name" />
                                    <YAxis tickFormatter={v => `${v}%`} />
                                    <Tooltip />
                                    <Bar dataKey="rate" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div style={{ background: '#fff', padding: '30px', borderRadius: '20px', border: '1px solid #ddd' }}>
                        <h3 style={{ margin: '0 0 25px 0', fontSize: '1.2rem', fontWeight: 800 }}>Recent Activity</h3>
                        <div style={{ display: 'grid', gap: '20px' }}>
                            {activities.slice(0, 5).map((act, i) => (
                                <div key={i} style={{ fontSize: '0.95rem', color: '#444' }}>
                                    <strong>•</strong> {act.description}
                                    <div style={{ fontSize: '0.8rem', color: '#999', marginLeft: '12px' }}>
                                        {act.timestamp ? new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Staff Table */}
                <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #ddd', padding: '25px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ color: '#888', fontSize: '0.85rem', fontWeight: 700, textAlign: 'left', borderBottom: '1px solid #eee' }}>
                                <th style={{ padding: '15px' }}>Name</th>
                                <th style={{ padding: '15px' }}>Employee ID</th>
                                <th style={{ padding: '15px' }}>Assigned</th>
                                <th style={{ padding: '15px' }}>Closed</th>
                                <th style={{ padding: '15px' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {salesStaff.slice(0, 5).map((staff, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                    <td style={{ padding: '15px' }}>
                                        <div style={{ fontWeight: 700 }}>{staff.firstName} {staff.lastName}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#999' }}>{staff.email}</div>
                                    </td>
                                    <td style={{ padding: '15px' }}>{staff.employeeId || '-'}</td>
                                    <td style={{ padding: '15px' }}>{staff.assignedLeadsCount}</td>
                                    <td style={{ padding: '15px' }}>{staff.closedLeadsCount}</td>
                                    <td style={{ padding: '15px', color: '#10b981', fontWeight: 700 }}>Active</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
