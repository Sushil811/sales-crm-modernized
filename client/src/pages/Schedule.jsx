import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const Schedule = ({ user }) => {
    const [scheduledLeads, setScheduledLeads] = useState([]);
    const [search, setSearch] = useState('');
    const [showFilter, setShowFilter] = useState(false);
    const [filterType, setFilterType] = useState('All');
    const [activeFilter, setActiveFilter] = useState('All');
    const [selectedLead, setSelectedLead] = useState(null);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState({ type: null, id: null });

    const fetchScheduled = useCallback(async () => {
        try {
            const uid = user?._id || user?.id;
            if (!uid) return;

            // Pass userId and role to get only assigned leads for Sales
            const res = await api.get('/leads', {
                params: {
                    userId: uid,
                    role: user.role,
                    limit: 100 // Get more for scheduling view
                }
            });

            const data = res.data?.leads || (Array.isArray(res.data) ? res.data : []);
            console.log('Fetched leads for schedule:', data.length);

            const filtered = data.filter(l => {
                const assignedId = l.assignedTo?._id || l.assignedTo?.id || l.assignedTo;
                const isMine = user.role === 'Admin' || assignedId === uid;
                // Match "Scheduled" type or status or has a scheduledDate
                return isMine && (
                    l.status === 'Ongoing' ||
                    l.status === 'Scheduled' ||
                    l.type === 'Scheduled' ||
                    l.scheduledDate
                );
            });

            filtered.sort((a, b) => new Date(a.scheduledDate || a.date) - new Date(b.scheduledDate || b.date));
            setScheduledLeads(filtered);
        } catch (error) {
            console.error('Fetch Scheduled Error:', error);
        }
    }, [user]);

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            if (isMounted) await fetchScheduled();
        };
        load();
        return () => { isMounted = false; };
    }, [fetchScheduled]);

    const filteredList = scheduledLeads.filter(l => {
        const matchesSearch = (l.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (l.source || '').toLowerCase().includes(search.toLowerCase()) ||
            (l.phone || '').toLowerCase().includes(search.toLowerCase());

        if (activeFilter === 'Today') {
            const today = new Date().toDateString();
            const schedDate = new Date(l.scheduledDate || l.date).toDateString();
            return matchesSearch && (schedDate === today);
        }

        return matchesSearch;
    });


    const [showEditInfoModal, setShowEditInfoModal] = useState(false);
    const [editLeadData, setEditLeadData] = useState({ name: '', email: '', source: '', location: '', language: '' });

    const handleEditInfoSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`/leads/${selectedLead._id}`, editLeadData);
            setShowEditInfoModal(false);
            fetchScheduled();
        } catch (error) { console.error('Edit Info Error:', error); }
    };

    const handleUpdateStatus = async (leadId, status, type) => {
        const leadToCheck = scheduledLeads.find(l => (l._id === leadId || l.id === leadId));
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
            fetchScheduled();
        } catch (error) { console.error('Error updating status:', error); }
    };

    const handleSchedule = async (e) => {
        e.preventDefault();
        const data = new FormData(e.target);
        const schedStr = `${data.get('date')}T${data.get('time')}`;
        try {
            await api.patch(`/leads/${selectedLead._id}`, {
                scheduledDate: new Date(schedStr),
                status: 'Scheduled'
            });
            setShowScheduleModal(false);
            fetchScheduled();
        } catch (error) {
            console.error('Schedule Error:', error);
            alert('Scheduling failed');
        }
    };

    return (
        <div style={{ background: '#f8f9fb', minHeight: '100vh', paddingBottom: '110px', fontFamily: "'Outfit', sans-serif" }}>
            {/* Header Section from Image 1 */}
            <div style={{
                background: 'linear-gradient(180deg, #2b59ff 0%, #1a47ff 100%)',
                padding: '40px 25px 60px 25px',
                borderBottomLeftRadius: '40px',
                borderBottomRightRadius: '40px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}></div>

                <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'flex-start' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                        <span style={{ color: '#fff' }}>Canova</span>
                        <span style={{ color: '#fbbf24' }}>CRM</span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '0px' }}>
                    <div onClick={() => window.history.back()} style={{ color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </div>
                    <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>Schedule</h2>
                </div>

                {/* Search Bar Section */}
                {/* <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1, marginTop: '20px' }}>
                        <input
                            placeholder="Search"
                            style={{
                                width: '100%', padding: '16px 20px 16px 55px', borderRadius: '18px',
                                border: 'none', background: 'rgba(255,255,255,0.2)', fontSize: '1.1rem', fontWeight: 600,
                                outline: 'none', color: '#fff', backdropFilter: 'blur(10px)'
                            }}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <div style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', opacity: 0.8, color: '#fff' }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </div>
                    </div>
                    <div
                        onClick={() => setShowFilter(!showFilter)}
                        style={{
                            background: '#fff', padding: '14px', borderRadius: '15px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2b59ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="4" y1="21" x2="4" y2="14"></line>
                            <line x1="4" y1="10" x2="4" y2="3"></line>
                            <line x1="12" y1="21" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12" y2="3"></line>
                            <line x1="20" y1="21" x2="20" y2="16"></line>
                            <line x1="20" y1="12" x2="20" y2="3"></line>
                            <path d="M1 14h6M9 8h6M17 16h6"></path>
                        </svg>
                    </div>
                </div> */}

                {/* Filter Popup Component */}
                {showFilter && (
                    <div style={{
                        position: 'absolute', top: '220px', right: '25px', width: '220px',
                        background: '#fff', borderRadius: '20px', padding: '15px',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.15)', zIndex: 100
                    }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#9ca3af', marginBottom: '15px', paddingLeft: '10px' }}>FILTER BY</div>
                        {['All', 'Today'].map(opt => (
                            <div
                                key={opt}
                                onClick={() => { setFilterType(opt); setShowFilter(false); setActiveFilter(opt); }}
                                style={{
                                    padding: '12px 15px', borderRadius: '12px', fontSize: '1rem', fontWeight: 700,
                                    background: filterType === opt ? '#f3f4f6' : 'transparent',
                                    color: filterType === opt ? '#2b59ff' : '#4b5563',
                                    cursor: 'pointer', marginBottom: '5px'
                                }}
                            >
                                {opt}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, marginTop: '20px' }}>
                    <input
                        placeholder="Search"
                        style={{
                            width: '100%', padding: '16px 20px 16px 55px', borderRadius: '18px',
                            border: 'none', background: 'rgba(255, 255, 255, 0.94)', fontSize: '1.1rem', fontWeight: 600,
                            outline: 'none', color: '#000000ff', backdropFilter: 'blur(10px)'
                        }}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <div style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', opacity: 0.8, color: '#fff' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>
                </div>
                <div
                    onClick={() => setShowFilter(!showFilter)}
                    style={{
                        background: '#fff', padding: '14px', borderRadius: '15px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2b59ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="4" y1="21" x2="4" y2="14"></line>
                        <line x1="4" y1="10" x2="4" y2="3"></line>
                        <line x1="12" y1="21" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12" y2="3"></line>
                        <line x1="20" y1="21" x2="20" y2="16"></line>
                        <line x1="20" y1="12" x2="20" y2="3"></line>
                        <path d="M1 14h6M9 8h6M17 16h6"></path>
                    </svg>
                </div>
            </div>


            {/* List Section */}
            <div style={{ padding: '30px 25px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    {filteredList.map((lead, idx) => {
                        const isPrimary = idx === 0;
                        const dateStr = new Date(lead.scheduledDate || lead.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });

                        return (
                            <div key={lead._id} style={{
                                background: isPrimary ? '#2b59ff' : '#fff',
                                color: isPrimary ? '#fff' : '#111827',
                                padding: '30px', borderRadius: '35px',
                                boxShadow: isPrimary ? '0 15px 35px rgba(43, 89, 255, 0.25)' : '0 8px 30px rgba(0,0,0,0.03)',
                                position: 'relative',
                                border: isPrimary ? 'none' : '1px solid #f1f5f9'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, opacity: 0.6, marginBottom: '5px', textTransform: 'uppercase' }}>{lead.source || 'Referral'}</div>
                                        <div style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '5px' }}>
                                            {lead.phone || '949-365-6533'}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, opacity: 0.6, marginBottom: '5px', textTransform: 'uppercase' }}>Date</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{dateStr}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '12px',
                                        background: isPrimary ? 'rgba(255,255,255,0.15)' : '#f1f5f9',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: isPrimary ? '#fff' : '#94a3b8'
                                    }}>
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                            <circle cx="12" cy="10" r="3"></circle>
                                        </svg>
                                    </div>
                                    <div style={{ fontWeight: 600, fontSize: '1.05rem', opacity: 0.9 }}>Call</div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${lead.assignedTo?.firstName || lead.name || 'User'}&background=${isPrimary ? 'fff' : '2b59ff'}&color=${isPrimary ? '2b59ff' : 'fff'}&bold=true`}
                                            style={{ width: '42px', height: '42px', borderRadius: '50%', border: isPrimary ? '2px solid rgba(255,255,255,0.3)' : 'none' }}
                                            alt="Avatar"
                                        />
                                        <div style={{ fontWeight: 600, fontSize: '1.05rem', opacity: 0.9 }}>
                                            {lead.assignedTo ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}` : (idx === 0 ? 'Brooklyn Williamson' : (idx === 1 ? 'Julie Watson' : 'Jenny Alexander'))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {filteredList.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '100px 0', opacity: 0.3 }}>
                            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '20px' }}>
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>No activities found</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals for Interactivity */}
            {showEditInfoModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                    <div style={{ background: '#fff', borderRadius: '35px', padding: '35px', width: '360px', boxShadow: '0 25px 60px rgba(0,0,0,0.15)' }}>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', marginBottom: '25px', textAlign: 'center' }}>Lead Information</div>
                        <form onSubmit={handleEditInfoSubmit}>
                            <div style={{ display: 'grid', gap: '15px', marginBottom: '30px' }}>
                                <div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9ca3af', marginBottom: '8px', marginLeft: '5px' }}>NAME</div>
                                    <input placeholder="Full Name" value={editLeadData.name} onChange={(e) => setEditLeadData({ ...editLeadData, name: e.target.value })} style={{ width: '100%', padding: '16px', borderRadius: '18px', border: '1.5px solid #f1f5f9', outline: 'none', fontSize: '1rem', fontWeight: 600 }} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9ca3af', marginBottom: '8px', marginLeft: '5px' }}>EMAIL</div>
                                    <input placeholder="Email Address" value={editLeadData.email} onChange={(e) => setEditLeadData({ ...editLeadData, email: e.target.value })} style={{ width: '100%', padding: '16px', borderRadius: '18px', border: '1.5px solid #f1f5f9', outline: 'none', fontSize: '1rem', fontWeight: 600 }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9ca3af', marginBottom: '8px', marginLeft: '5px' }}>SOURCE</div>
                                        <input placeholder="Source" value={editLeadData.source} onChange={(e) => setEditLeadData({ ...editLeadData, source: e.target.value })} style={{ width: '100%', padding: '16px', borderRadius: '18px', border: '1.5px solid #f1f5f9', outline: 'none', fontSize: '1rem', fontWeight: 600 }} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9ca3af', marginBottom: '8px', marginLeft: '5px' }}>LANGUAGE</div>
                                        <input placeholder="Language" value={editLeadData.language} onChange={(e) => setEditLeadData({ ...editLeadData, language: e.target.value })} style={{ width: '100%', padding: '16px', borderRadius: '18px', border: '1.5px solid #f1f5f9', outline: 'none', fontSize: '1rem', fontWeight: 600 }} />
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button type="button" onClick={() => setShowEditInfoModal(false)} style={{ flex: 1, padding: '18px', borderRadius: '20px', background: '#f8fafc', color: '#64748b', border: 'none', fontWeight: 800, cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ flex: 1, padding: '18px', borderRadius: '20px', background: '#2b59ff', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 20px rgba(43, 89, 255, 0.3)' }}>Save Change</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showScheduleModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                    <div style={{ background: '#fff', borderRadius: '35px', padding: '35px', width: '320px', boxShadow: '0 25px 60px rgba(0,0,0,0.15)' }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', marginBottom: '25px', textAlign: 'center' }}>Reschedule Follow-up</div>
                        <form onSubmit={handleSchedule}>
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9ca3af', marginBottom: '10px' }}>NEW DATE</div>
                                <input name="date" type="date" required style={{ width: '100%', padding: '16px', borderRadius: '18px', border: '1.5px solid #f1f5f9', outline: 'none', fontSize: '1rem', fontWeight: 600 }} />
                            </div>
                            <div style={{ marginBottom: '30px' }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9ca3af', marginBottom: '10px' }}>NEW TIME</div>
                                <input name="time" type="time" required style={{ width: '100%', padding: '16px', borderRadius: '18px', border: '1.5px solid #f1f5f9', outline: 'none', fontSize: '1rem', fontWeight: 600 }} />
                            </div>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button type="button" onClick={() => setShowScheduleModal(false)} style={{ flex: 1, padding: '18px', borderRadius: '20px', background: '#f8fafc', color: '#64748b', border: 'none', fontWeight: 800, cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ flex: 1, padding: '18px', borderRadius: '20px', background: '#2e5bff', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 20px rgba(46, 91, 255, 0.3)' }}>Update</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <div style={{
                position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff',
                borderTop: '1px solid #f1f5f9', padding: '15px 25px', display: 'flex',
                justifyContent: 'space-between', alignItems: 'center', zIndex: 1000,
                boxShadow: '0 -4px 20px rgba(0,0,0,0.03)'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', opacity: 0.4 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Home</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', opacity: 0.4 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Leads</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', color: '#2b59ff' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>Schedule</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', opacity: 0.4 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Profile</span>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default Schedule;

