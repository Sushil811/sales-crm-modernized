import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import './EmployeePanel.css';

const EmployeePanel = ({ user }) => {
    // State for Home section
    const [checkInTime, setCheckInTime] = useState(null);
    const [checkOutTime, setCheckOutTime] = useState(null);
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [isOnBreak, setIsOnBreak] = useState(false);
    const [hasAttemptedAutoCheckIn, setHasAttemptedAutoCheckIn] = useState(false);
    const [breakStartTime, setBreakStartTime] = useState(null);
    const [breakLogs, setBreakLogs] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);
    const [assignedLeads, setAssignedLeads] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // State for Assigned Leads
    // const [assignedLeads, setAssignedLeads] = useState([]);
    
    // State for Schedules
    // const [schedules, setSchedules] = useState([]);
    /* const [filters, setFilters] = useState({
        from: '',
        number: '',
        call: '',
        name: '',
        scheduleDate: ''
    }); */

    // Fetch attendance and break data
    const fetchAttendanceData = useCallback(async () => {
        try {
            const uid = user?._id || user?.id;
            if (!uid) return;
            
            const res = await api.get(`/attendance/dashboard-summary/${uid}`);
            const data = res.data;
            
            setCheckInTime(data.todayCheckIn || null);
            setCheckOutTime(data.previousCheckOut || null);
            setIsCheckedIn(data.isCheckedIn || false);
            setIsOnBreak(data.isOnBreak || false);
            
            // Find current active break start time if it exists
            if (data.isOnBreak && data.breakHistory && data.breakHistory.length > 0) {
                const activeBreak = data.breakHistory.find(b => !b.end);
                setBreakStartTime(activeBreak ? activeBreak.start : null);
            } else {
                setBreakStartTime(null);
            }
            
            if (data.breakHistory) {
                const formattedLogs = data.breakHistory.map(log => {
                    const d = new Date(log.date);
                    const dd = String(d.getDate()).padStart(2, '0');
                    const mm = String(d.getMonth() + 1).padStart(2, '0');
                    const yy = String(d.getFullYear()).slice(-2);
                    return {
                        start: log.start ? new Date(log.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toUpperCase() : '--:--',
                        end: log.end ? new Date(log.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toUpperCase() : '--:--',
                        date: `${dd}/${mm}/${yy}`
                    };
                }).slice(0, 4);
                setBreakLogs(formattedLogs);
            }
        } catch (error) {
            console.error('Error fetching attendance:', error);
            // Mock data for demo - simulating current day check-in and previous day check-out
            const now = new Date();
            const todayCheckIn = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(18, 30, 0); // 6:30 PM yesterday
            const previousCheckOut = yesterday.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            setCheckInTime(todayCheckIn);
            setCheckOutTime(previousCheckOut);
            setIsCheckedIn(true);
            setIsOnBreak(false);
            /* setBreakLogs([
                { date: new Date().toLocaleDateString('en-CA'), startTime: '01:00 PM', endTime: '01:15 PM', duration: '15' },
                { date: new Date(Date.now() - 86400000).toLocaleDateString('en-CA'), startTime: '12:45 PM', endTime: '01:00 PM', duration: '15' },
                { date: new Date(Date.now() - 2 * 86400000).toLocaleDateString('en-CA'), startTime: '01:30 PM', endTime: '01:45 PM', duration: '15' },
                { date: new Date(Date.now() - 3 * 86400000).toLocaleDateString('en-CA'), startTime: '02:00 PM', endTime: '02:20 PM', duration: '20' }
            ]); */
        }
    }, [user]);

    // Fetch recent activities
    const fetchRecentActivities = useCallback(async () => {
        try {
            const res = await api.get('/dashboard/activities');
            setRecentActivities(res.data.map(act => ({
                action: act.description,
                time: act.timestamp ? new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'
            })).slice(0, 5)); 
        } catch (error) {
            console.error('Error fetching activities:', error);
            setRecentActivities([
                { action: 'You were assigned 3 more new lead', time: '1 hour ago' },
                { action: 'You Closed a deal today', time: '2 hours ago' }
            ]);
        }
    }, []);


    const handleUpdateStatus = useCallback(async (leadId, status, type) => {
        const leadToCheck = assignedLeads.find(l => l._id === leadId);
        if (status === 'Closed' && leadToCheck?.scheduledDate) {
            const now = new Date();
            const sched = new Date(leadToCheck.scheduledDate);
            if (sched > now) {
                alert(`Cannot close lead before scheduled time: ${sched.toLocaleString()}`);
                return;
            }
        }
        try {
            await api.patch(`/leads/${leadId}`, { status, type });
            fetchAssignedLeads();
        } catch (error) { console.error('Error updating status:', error); }
    }, [assignedLeads]);

    const fetchAssignedLeads = useCallback(async () => {
        try {
            const uid = user?._id || user?.id;
            if (!uid) return;
            const res = await api.get('/leads', {
                params: {
                    userId: uid,
                    role: user.role,
                    limit: 10
                }
            });
            const data = res.data?.leads || (Array.isArray(res.data) ? res.data : []);
            setAssignedLeads(data);
            
            // Mock break logs for 4 days as per image
            setBreakLogs([
                { start: '01:25 pm', end: '02:15 PM', date: '10/04/25' },
                { start: '01:00 pm', end: '02:05 PM', date: '09/04/25' },
                { start: '01:05 pm', end: '02:30 PM', date: '08/04/25' },
                { start: '01:10 pm', end: '02:00 PM', date: '07/04/25' }
            ]);
        } catch (error) {
            console.error('Error fetching leads:', error);
            // Fallback mock data
            setAssignedLeads([
                { id: 1, name: 'John Smith', email: 'john@example.com', assignedDate: '2024-03-20', status: 'Ongoing', type: 'Hot', scheduledDate: '2026-03-20T14:00:00' },
                { id: 2, name: 'Emma Johnson', email: 'emma@example.com', assignedDate: '2024-03-19', status: 'Ongoing', type: 'Warm', scheduledDate: null },
                { id: 3, name: 'Michael Brown', email: 'michael@example.com', assignedDate: '2024-03-18', status: 'Closed', type: 'Cold', scheduledDate: null }
            ]);
        }
    }, [user, handleUpdateStatus]);

    // Fetch schedules
    const fetchSchedules = useCallback(async () => {
        try {
            // const res = await api.get('/ s ' ); // Fix later or keep commented
            /* const res = await api.get('/schedules'); */
            // console.log(res); 
            // setSchedules(res.data);
        } catch (error) {
            console.error('Error fetching schedules:', error);
            // Mock data for demo
            /* setSchedules([
                { id: 1, from: 'Client', number: '+1 234 567 890', call: 'Outgoing', name: 'John Doe', scheduleDate: '2024-03-21 10:00 AM' },
                { id: 2, from: 'Internal', number: '+1 987 654 321', call: 'Incoming', name: 'Jane Smith', scheduleDate: '2024-03-21 11:30 AM' },
                { id: 3, from: 'Client', number: '+1 555 123 456', call: 'Outgoing', name: 'Robert Johnson', scheduleDate: '2024-03-21 2:00 PM' },
                { id: 4, from: 'Partner', number: '+1 888 999 000', call: 'Missed', name: 'Emily Davis', scheduleDate: '2024-03-20 4:15 PM' }
            ]); */
        }
    }, []);

    // Fetch initial data
    useEffect(() => {
        let mounted = true;
        const init = async () => {
            if (mounted) {
                await fetchAttendanceData();
                await fetchRecentActivities();
                await fetchAssignedLeads();
            }
        };
        init();
        return () => { mounted = false; };
    }, [fetchAttendanceData, fetchRecentActivities, fetchAssignedLeads]);

    // Auto Check-In on login/load if not already checked in
    useEffect(() => {
        if (!hasAttemptedAutoCheckIn) {
            const autoLogin = async () => {
                const uid = user?._id || user?.id || localStorage.getItem('userId');
                if (!uid) return;
                
                try {
                    // Check status first to avoid redundant check-ins
                    const res = await api.get(`/attendance/dashboard-summary/${uid}`);
                    if (!res.data.isCheckedIn) {
                        await api.post('/attendance/checkin', { userId: uid });
                    }
                    setHasAttemptedAutoCheckIn(true);
                    await fetchAttendanceData();
                } catch (e) { 
                    console.error('Auto Check-In failed', e); 
                    setHasAttemptedAutoCheckIn(true);
                }
            };
            autoLogin();
        }
    }, [user, fetchAttendanceData, hasAttemptedAutoCheckIn]);

    const handleAttendanceToggle = async () => {
        if (isProcessing) return;
        const uid = user?._id || user?.id || localStorage.getItem('userId');
        if (!uid) return;

        setIsProcessing(true);
        try {
            if (isCheckedIn) {
                await api.post('/attendance/checkout', { userId: uid });
            } else {
                await api.post('/attendance/checkin', { userId: uid });
            }
            await fetchAttendanceData();
        } catch (error) {
            console.error('Error toggling attendance:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    // Handle break start/end
    const handleBreakToggle = async (e) => {
        e.stopPropagation();
        if (isProcessing) return;
        if (!isCheckedIn) {
            alert('Please check in first before taking a break.');
            return;
        }

        const uid = user?._id || user?.id || localStorage.getItem('userId');
        if (!uid) return;

        setIsProcessing(true);
        try {
            await api.post('/attendance/break', { userId: uid, type: isOnBreak ? 'end' : 'start' });
            await fetchAttendanceData();
        } catch (error) {
            console.error('Error toggling break:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="employee-panel-container">
            {/* Header Section */}
            <div className="employee-header">
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}></div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '25px' }}>
                    <span style={{ color: '#fff' }}>Canova</span>
                    <span style={{ color: '#fbbf24' }}>CRM</span>
                </div>
                <div>
                    <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 600, opacity: 0.9, marginBottom: '8px' }}>Good Morning</div>
                    <h1 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>
                        {user?.firstName || 'Rajesh'} {user?.lastName || 'Mehta'}
                    </h1>
                </div>
            </div>

            <div style={{ padding: '30px 25px' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '25px' }}>Timings</h3>

                {/* Attendance Summary Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                    {/* Check In/Out Card */}
                    <div 
                        onClick={handleAttendanceToggle}
                        style={{ 
                            background: '#2b59ff', borderRadius: '20px', padding: '25px', 
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            color: '#fff', boxShadow: '0 10px 30px rgba(43, 89, 255, 0.2)',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{ display: 'flex', gap: '40px' }}>
                            <div>
                                <div style={{ fontSize: '1rem', fontWeight: 700, opacity: 0.9, marginBottom: '8px' }}>Checked-In</div>
                                <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{isCheckedIn ? (checkInTime ? new Date(checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toUpperCase() : '9:15 AM') : '--:--'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '1rem', fontWeight: 700, opacity: 0.9, marginBottom: '8px' }}>Check Out</div>
                                <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{checkOutTime ? new Date(checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toUpperCase() : '--:--'}</div>
                            </div>
                        </div>
                        <div style={{ width: '15px', height: '40px', background: isCheckedIn ? '#44ff44' : '#ff4444', borderRadius: '20px', border: '2px solid rgba(255,255,255,0.3)' }}></div>
                    </div>

                    {/* Active Break Card / Log Card Combined View */}
                    <div style={{ background: '#fff', borderRadius: '25px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                        <div style={{ 
                            background: '#2b59ff', padding: '25px', 
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                            color: '#fff' 
                        }}>
                            <div style={{ display: 'flex', gap: '40px' }}>
                                <div>
                                    <div style={{ fontSize: '1rem', fontWeight: 700, opacity: 0.9, marginBottom: '8px' }}>Break</div>
                                    <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                                        {isOnBreak 
                                            ? (breakStartTime ? new Date(breakStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toUpperCase() : 'NOW') 
                                            : (breakLogs.length > 0 ? breakLogs[0].start : '01:25 PM')
                                        }
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '1rem', fontWeight: 700, opacity: 0.9, marginBottom: '8px' }}>Ended</div>
                                    <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{isOnBreak ? '--:--' : (breakLogs.length > 0 ? breakLogs[0].end : '02:15 PM')}</div>
                                </div>
                            </div>
                            <div 
                                onClick={handleBreakToggle}
                                style={{ 
                                    width: '15px', height: '40px', 
                                    background: isOnBreak ? '#44ff44' : '#ff4444', 
                                    borderRadius: '20px', border: '2px solid rgba(255,255,255,0.3)',
                                    cursor: 'pointer'
                                }}
                            ></div>
                        </div>

                        {/* Break History Table */}
                        <div style={{ padding: '15px 5px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ color: '#111827', fontSize: '1rem', fontWeight: 800 }}>
                                        <th style={{ padding: '15px', textAlign: 'left' }}>Break</th>
                                        <th style={{ padding: '15px', textAlign: 'left' }}>Ended</th>
                                        <th style={{ padding: '15px', textAlign: 'right' }}>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {breakLogs.map((log, i) => (
                                        <tr key={i} style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>
                                            <td style={{ padding: '15px', borderTop: '1px solid #f1f5f9' }}>{log.start}</td>
                                            <td style={{ padding: '15px', borderTop: '1px solid #f1f5f9' }}>{log.end}</td>
                                            <td style={{ padding: '15px', borderTop: '1px solid #f1f5f9', textAlign: 'right' }}>{log.date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '20px' }}>Recent Activity</h3>
                <div style={{ background: '#f1f1f1', borderRadius: '25px', padding: '30px', borderLeft: '10px solid #e1e1e1' }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '25px' }}>
                        {recentActivities.map((act, i) => (
                            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#94a3b8', marginTop: '8px' }}></div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#4b5563', lineHeight: '1.5' }}>
                                    {act.action} <span style={{ opacity: 0.6 }}>– {act.time}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Assigned Leads Table Section */}
                <div style={{ marginTop: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', padding: '0 5px' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', margin: 0 }}>Assigned Leads</h3>
                        <span style={{ color: '#3b82f6', fontWeight: 700, cursor: 'pointer' }}>See Breakdown</span>
                    </div>

                    <div style={{ background: '#fff', borderRadius: '35px', padding: '15px', boxShadow: '0 15px 40px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' }}>
                            <thead>
                                <tr style={{ color: '#9ca3af', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'left' }}>
                                    <th style={{ padding: '15px 20px' }}>Name</th>
                                    <th style={{ padding: '15px 20px' }}>Email</th>
                                    <th style={{ padding: '15px 20px' }}>Assigned Date</th>
                                    <th style={{ padding: '15px 20px' }}>Status</th>
                                    <th style={{ padding: '15px 20px' }}>Type</th>
                                    <th style={{ padding: '15px 20px' }}>Schedule Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assignedLeads.map((lead) => {
                                    const assignedDateStr = new Date(lead.date || lead.createdAt).toLocaleDateString('en-GB');
                                    const schedTime = lead.scheduledDate ? new Date(lead.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---';
                                    
                                    return (
                                        <tr key={lead._id || lead.id} style={{ background: '#f8fafc', transition: 'transform 0.2s' }}>
                                            <td style={{ padding: '20px', borderRadius: '20px 0 0 20px', fontWeight: 800, color: '#111827' }}>{lead.name}</td>
                                            <td style={{ padding: '20px', fontWeight: 600, color: '#64748b' }}>{lead.email}</td>
                                            <td style={{ padding: '20px', fontWeight: 700, color: '#1a47ff' }}>{assignedDateStr}</td>
                                            <td style={{ padding: '20px' }}>
                                                <select 
                                                    value={lead.status || 'Ongoing'} 
                                                    onChange={(e) => handleUpdateStatus(lead._id || lead.id, e.target.value, lead.type)}
                                                    style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', background: lead.status === 'Closed' ? '#111827' : '#fff', color: lead.status === 'Closed' ? '#fff' : '#111827' }}
                                                >
                                                    <option value="Ongoing">Ongoing</option>
                                                    <option value="Closed">Closed</option>
                                                </select>
                                            </td>
                                            <td style={{ padding: '20px' }}>
                                                <select 
                                                    value={lead.type || 'Hot'} 
                                                    onChange={(e) => handleUpdateStatus(lead._id || lead.id, lead.status, e.target.value)}
                                                    style={{ 
                                                        padding: '8px 12px', borderRadius: '10px', border: 'none', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
                                                        background: lead.type === 'Hot' ? '#F77307' : (lead.type === 'Warm' ? '#F7D307' : '#07EFF7'),
                                                        color: lead.type === 'Hot' ? '#fff' : '#111827'
                                                    }}
                                                >
                                                    <option value="Hot">Hot</option>
                                                    <option value="Warm">Warm</option>
                                                    <option value="Cold">Cold</option>
                                                </select>
                                            </td>
                                            <td style={{ padding: '20px', borderRadius: '0 20px 20px 0', fontWeight: 800, color: '#4b5563' }}>{schedTime}</td>
                                        </tr>
                                    );
                                })}
                                {assignedLeads.length === 0 && (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontWeight: 600 }}>No leads assigned yet</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default EmployeePanel;