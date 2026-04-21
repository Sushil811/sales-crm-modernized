import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const Leads = ({ user }) => {
    // const navigate = useNavigate();
    const [leads, setLeads] = useState([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedLead, setSelectedLead] = useState(null);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showCSVModal, setShowCSVModal] = useState(false);
    const [showManualModal, setShowManualModal] = useState(false);
    const [csvFile, setCsvFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [activeDropdown, setActiveDropdown] = useState({ type: null, id: null });
    const [showEditInfoModal, setShowEditInfoModal] = useState(false);
    const [editLeadData, setEditLeadData] = useState({ name: '', email: '', source: '', location: '', language: '' });

    const handleEditInfoSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/leads/${selectedLead._id}`, editLeadData);
            setShowEditInfoModal(false);
            fetchLeads();
        } catch (error) { console.error('Edit Info Error:', error); }
    };

    const fetchLeads = useCallback(async () => {
        try {
            const url = user.role === 'Sales'
                ? `/leads?userId=${user._id}&role=${user.role}&search=${search}&page=${page}`
                : `/leads?search=${search}&page=${page}`;
            const res = await api.get(url);
            if (res.data.leads) {
                setLeads(res.data.leads);
                setTotalPages(res.data.totalPages || 1);
            } else {
                setLeads(Array.isArray(res.data) ? res.data : []);
                setTotalPages(1);
            }
        } catch (error) { console.error('Fetch Leads Error:', error); }
    }, [user, search, page]);

    useEffect(() => {
        const timer = setTimeout(fetchLeads, 300);
        return () => clearTimeout(timer);
    }, [fetchLeads]);

    const handleCSVUpload = async () => {
        if (!csvFile) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('file', csvFile);
        try {
            let p = 0;
            const iv = setInterval(() => { p += 10; setUploadProgress(p); if (p >= 90) clearInterval(iv); }, 100);
            await api.post('/leads/upload', formData);
            clearInterval(iv);
            setUploadProgress(100);
            setTimeout(() => {
                setShowCSVModal(false);
                setUploading(false);
                setCsvFile(null);
                setUploadProgress(0);
                fetchLeads();
            }, 500);
        } catch (error) {
            console.error('Upload Error:', error);
            alert('Upload failed');
            setUploading(false);
        }
    };

    const handleUpdateStatus = async (leadId, status, type) => {
        if (status === 'Closed') {
            const now = new Date();
            // find the specific lead to check scheduled date if needed
            const leadToCheck = leads.find(l => l._id === leadId);
            const schedDate = leadToCheck?.scheduledDate ? new Date(leadToCheck.scheduledDate) : null;
            if (schedDate && schedDate > now) {
                alert("This lead is scheduled for a future call and cannot be closed yet.");
                return;
            }
        }
        try {
            await api.patch(`/leads/${leadId}`, { status, type });
            fetchLeads();
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
            fetchLeads();
        } catch (error) {
            console.error('Schedule Error:', error);
            alert('Scheduling failed');
        }
    };

    const renderPagination = () => {
        let pages = [];
        for (let i = 1; i <= totalPages; i++) pages.push(i);
        if (totalPages <= 1) return null;
        return (
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '30px' }}>
                {pages.map(p => (
                    <button key={p} onClick={() => setPage(p)} style={{
                        width: '35px', height: '35px', borderRadius: '8px', border: 'none',
                        background: page === p ? '#2563eb' : '#eee', color: page === p ? '#fff' : '#666',
                        fontWeight: 700, cursor: 'pointer'
                    }}>{p}</button>
                ))}
            </div>
        );
    };

    if (user.role === 'Sales') {
        return (
            <div style={{ background: '#f8f9fb', minHeight: '100vh', paddingBottom: '110px', fontFamily: "'Outfit', sans-serif" }}>
                {/* Modern Header matching Image */}
                <div style={{
                    background: 'linear-gradient(180deg, #2b59ff 0%, #1a45ff 100%)',
                    padding: '40px 25px 60px 25px',
                    borderBottomLeftRadius: '40px',
                    borderBottomRightRadius: '40px',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}></div>

                    <div style={{ marginBottom: '25px', fontSize: '1.4rem', fontWeight: 800, display: 'flex', gap: '2px' }}>
                        <span style={{ color: '#fff' }}>Canova</span>
                        <span style={{ color: '#fbbf24' }}>CRM</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div onClick={() => window.history.back()} style={{ color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </div>
                        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>Leads</h2>
                    </div>
                </div>

                <div style={{ padding: '0 25px' }}>
                    {/* Stylized Search Bar below header */}
                    <div style={{ position: 'relative', margin: '30px 0' }}>
                        <input
                            placeholder="Search"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            style={{
                                width: '100%', padding: '16px 20px 16px 60px', borderRadius: '20px',
                                border: 'none', background: '#e2e5ec', fontSize: '1.1rem', fontWeight: 600,
                                outline: 'none', color: '#6b7280'
                            }}
                        />
                        <div style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#111827' }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                        {leads.map((lead) => {
                            const isClosed = lead.status === 'Closed';

                            // Map colors based on status/type as per image
                            const accentColor = isClosed ? '#d1bda1' : (lead.type === 'Hot' ? '#F77307' : (lead.type === 'Warm' ? '#F7D307' : '#07EFF7'));
                            const dateStr = new Date(lead.date).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });

                            return (
                                <div key={lead._id} style={{
                                    background: '#fff',
                                    borderRadius: '30px',
                                    padding: '25px',
                                    position: 'relative',
                                    boxShadow: '0 8px 30px rgba(0,0,0,0.03)',
                                    border: '1px solid #f1f5f9'
                                }}>
                                    {/* Left Accent Bar */}
                                    <div style={{
                                        position: 'absolute', left: 0, top: '25%', bottom: '25%',
                                        width: '6px', background: accentColor, borderRadius: '0 10px 10px 0'
                                    }}></div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>{lead.name}</div>
                                            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#9ca3af' }}>@{lead.email || 'Tannerfisher@gmail.com'}</div>
                                        </div>

                                        {/* Status Circle */}
                                        <div style={{
                                            width: '85px', height: '85px', borderRadius: '50%',
                                            border: `9px solid ${accentColor}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: isClosed ? '#f3f4f6' : '#fff',
                                            boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.05)'
                                        }}>
                                            <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#111827' }}>{lead.status}</span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#6b7280' }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
                                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                <line x1="3" y1="10" x2="21" y2="10"></line>
                                            </svg>
                                            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#4b5563' }}>{dateStr}</span>
                                        </div>

                                        <div style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                                            {/* First Icon: Action Dropdown */}
                                            <div style={{ position: 'relative' }}>
                                                <div
                                                    onClick={() => setActiveDropdown(prev => (prev.id === lead._id && prev.type === 'first') ? { id: null, type: null } : { id: lead._id, type: 'first' })}
                                                    style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2.5px solid #2b59ff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2b59ff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                    </svg>
                                                </div>

                                                {activeDropdown.id === lead._id && activeDropdown.type === 'first' && (
                                                    <div style={{ position: 'absolute', top: '40px', left: 0, background: '#fff', borderRadius: '15px', padding: '15px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', zIndex: 100, width: '220px', border: '1px solid #f1f5f9', animation: 'fadeIn 0.2s', color: '#111827' }}>
                                                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', margin: '15px 0 10px 5px', textTransform: 'uppercase' }}>Lead Heat Level</div>
                                                        <div style={{ display: 'grid', gap: '8px' }}>
                                                            {[{ l: 'Hot', c: '#F77307', tc: '#fff' }, { l: 'Warm', c: '#F7D307', tc: '#111827' }, { l: 'Cold', c: '#07EFF7', tc: '#111827' }].map(t => (
                                                                <div
                                                                    key={t.l}
                                                                    onClick={() => { handleUpdateStatus(lead._id, lead.status, t.l); setActiveDropdown({ id: null, type: null }); }}
                                                                    style={{
                                                                        padding: '12px', borderRadius: '10px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer',
                                                                        background: t.c, color: t.tc, border: lead.type === t.l ? '2.5px solid #111827' : 'none',
                                                                        boxShadow: lead.type === t.l ? '0 4px 10px rgba(0,0,0,0.15)' : 'none',
                                                                        transform: lead.type === t.l ? 'scale(1.02)' : 'scale(1)',
                                                                        transition: 'all 0.2s'
                                                                    }}
                                                                >
                                                                    {t.l} Level
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Clock Icon (STAY AS IS: SCHEDULE) */}
                                            <div onClick={() => { setSelectedLead(lead); setShowScheduleModal(true); }} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2.5px solid #2b59ff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2b59ff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                    <circle cx="12" cy="12" r="10"></circle>
                                                    <polyline points="12 6 12 12 16 14"></polyline>
                                                </svg>
                                            </div>

                                            {/* Last Icon: Status Dropdown (Outgoing, Closed, Scheduled) */}
                                            <div style={{ position: 'relative' }}>
                                                <div
                                                    onClick={() => setActiveDropdown(prev => (prev.id === lead._id && prev.type === 'last') ? { id: null, type: null } : { id: lead._id, type: 'last' })}
                                                    style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2.5px solid #2b59ff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2b59ff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="6 9 12 15 18 9"></polyline>
                                                    </svg>
                                                </div>

                                                {activeDropdown.id === lead._id && activeDropdown.type === 'last' && (
                                                    <div style={{ position: 'absolute', top: '40px', right: 0, background: '#fff', borderRadius: '15px', padding: '10px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', zIndex: 100, width: '160px', border: '1px solid #f1f5f9', animation: 'fadeIn 0.2s', color: '#111827' }}>
                                                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', margin: '5px 0 8px 10px', textTransform: 'uppercase' }}>Lead Status</div>
                                                        {['Ongoing', 'Closed'].map(status => (
                                                            <div
                                                                key={status}
                                                                onClick={() => { handleUpdateStatus(lead._id, status, lead.type || 'Hot'); setActiveDropdown({ id: null, type: null }); }}
                                                                style={{ padding: '10px 15px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', background: lead.status === status ? '#f0f4ff' : 'transparent', color: lead.status === status ? '#2b59ff' : '#64748b', transition: 'all 0.2s' }}
                                                            >
                                                                {status}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {leads.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '100px 0', opacity: 0.3 }}>
                            <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>No leads identified</div>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>{renderPagination()}</div>

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
                                                <input placeholder="Ex: Referral" value={editLeadData.source} onChange={(e) => setEditLeadData({ ...editLeadData, source: e.target.value })} style={{ width: '100%', padding: '16px', borderRadius: '18px', border: '1.5px solid #f1f5f9', outline: 'none', fontSize: '1rem', fontWeight: 600 }} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9ca3af', marginBottom: '8px', marginLeft: '5px' }}>LANGUAGE</div>
                                                <input placeholder="Ex: English" value={editLeadData.language} onChange={(e) => setEditLeadData({ ...editLeadData, language: e.target.value })} style={{ width: '100%', padding: '16px', borderRadius: '18px', border: '1.5px solid #f1f5f9', outline: 'none', fontSize: '1rem', fontWeight: 600 }} />
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9ca3af', marginBottom: '8px', marginLeft: '5px' }}>LOCATION</div>
                                            <input placeholder="City, State" value={editLeadData.location} onChange={(e) => setEditLeadData({ ...editLeadData, location: e.target.value })} style={{ width: '100%', padding: '16px', borderRadius: '18px', border: '1.5px solid #f1f5f9', outline: 'none', fontSize: '1rem', fontWeight: 600 }} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '15px' }}>
                                        <button type="button" onClick={() => setShowEditInfoModal(false)} style={{ flex: 1, padding: '18px', borderRadius: '20px', background: '#f8fafc', color: '#64748b', border: 'none', fontWeight: 800, cursor: 'pointer' }}>Cancel</button>
                                        <button type="submit" style={{ flex: 1, padding: '18px', borderRadius: '20px', background: '#2b59ff', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 20px rgba(43, 89, 255, 0.3)' }}>Save Changes</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {showScheduleModal && (
                        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                            <div style={{ background: '#fff', borderRadius: '35px', padding: '35px', width: '340px', boxShadow: '0 25px 60px rgba(0,0,0,0.15)' }}>
                                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', marginBottom: '25px', textAlign: 'center' }}>Schedule Follow-up</div>
                                <form onSubmit={handleSchedule}>
                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9ca3af', marginBottom: '10px' }}>SELECT DATE</div>
                                        <input name="date" type="date" required style={{ width: '100%', padding: '16px', borderRadius: '18px', border: '1.5px solid #f1f5f9', outline: 'none', fontSize: '1rem', fontWeight: 600 }} />
                                    </div>
                                    <div style={{ marginBottom: '30px' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9ca3af', marginBottom: '10px' }}>SELECT TIME</div>
                                        <input name="time" type="time" required style={{ width: '100%', padding: '16px', borderRadius: '18px', border: '1.5px solid #f1f5f9', outline: 'none', fontSize: '1rem', fontWeight: 600 }} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '15px' }}>
                                        <button type="button" onClick={() => setShowScheduleModal(false)} style={{ flex: 1, padding: '18px', borderRadius: '20px', background: '#f8fafc', color: '#64748b', border: 'none', fontWeight: 800, cursor: 'pointer' }}>Cancel</button>
                                        <button type="submit" style={{ flex: 1, padding: '18px', borderRadius: '20px', background: '#2e5bff', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 20px rgba(46, 91, 255, 0.3)' }}>Schedule</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
                <style>{`
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                `}</style>
            </div>
        );
    }

    return (
        <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '0 0 50px 0', fontFamily: "'Outfit', sans-serif" }}>
            <div style={{ background: '#fff', padding: '20px 50px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
                    <input placeholder="Search here..." style={{ width: '100%', padding: '14px 20px 14px 50px', borderRadius: '15px', background: '#f0f0f0', border: 'none', fontSize: '0.95rem', outline: 'none', fontWeight: 500, color: '#444' }} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                    <div style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </div>
                </div>
            </div>
            <div style={{ padding: '35px 50px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: '#999' }}>Home <span style={{ opacity: 0.4, margin: '0 10px' }}>›</span> <span style={{ color: '#1a1a1a' }}>Leads</span></div>
                    <div style={{ display: 'flex', gap: '18px' }}>
                        <button onClick={() => setShowManualModal(true)} style={{ padding: '14px 28px', borderRadius: '15px', background: '#e0e0e0', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Add Manually</button>
                        <button onClick={() => setShowCSVModal(true)} style={{ padding: '14px 28px', borderRadius: '15px', background: '#e0e0e0', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Add CSV</button>
                    </div>
                </div>
                <div style={{ background: '#fff', borderRadius: '30px', border: '1.5px solid #f0f0f0', padding: '25px', boxShadow: '0 10px 40px rgba(0,0,0,0.02)', minHeight: '650px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ overflowX: 'auto', flex: 1 }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' }}>
                            <thead>
                                <tr style={{ color: '#888', fontSize: '0.85rem', fontWeight: 600, textAlign: 'left' }}>
                                    <th>No.</th><th>Name</th><th>Email</th><th>Source</th><th>Date</th><th>Location</th><th>Language</th><th>Assigned To</th><th>Status</th><th>Type</th><th>Scheduled Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leads.map((lead, idx) => (
                                    <tr key={lead._id}>
                                        <td style={{ padding: '15px 20px', background: '#fff', border: '1px solid #d1d5db', borderRight: 'none', borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px' }}>{(page - 1) * 10 + idx + 1}</td>
                                        <td style={{ padding: '15px 20px', background: '#fff', borderTop: '1px solid #d1d5db', borderBottom: '1px solid #d1d5db', fontWeight: 800 }}>{lead.name}</td>
                                        <td style={{ padding: '15px 20px', background: '#fff', borderTop: '1px solid #d1d5db', borderBottom: '1px solid #d1d5db' }}>{lead.email}</td>
                                        <td style={{ padding: '15px 20px', background: '#fff', borderTop: '1px solid #d1d5db', borderBottom: '1px solid #d1d5db' }}>{lead.source || 'Referral'}</td>
                                        <td style={{ padding: '15px 20px', background: '#fff', borderTop: '1px solid #d1d5db', borderBottom: '1px solid #d1d5db' }}>{new Date(lead.date).toLocaleDateString()}</td>
                                        <td style={{ padding: '15px 20px', background: '#fff', borderTop: '1px solid #d1d5db', borderBottom: '1px solid #d1d5db' }}>{lead.location || 'Mumbai'}</td>
                                        <td style={{ padding: '15px 20px', background: '#fff', borderTop: '1px solid #d1d5db', borderBottom: '1px solid #d1d5db' }}>{lead.language || 'English'}</td>
                                        <td style={{ padding: '15px 20px', background: '#fff', borderTop: '1px solid #d1d5db', borderBottom: '1px solid #d1d5db', color: '#3154f3', fontWeight: 600 }}>{lead.assignedTo?.name || 'Unassigned'}</td>
                                        <td style={{ padding: '15px 20px', background: '#fff', borderTop: '1px solid #d1d5db', borderBottom: '1px solid #d1d5db', fontWeight: 700 }}>{lead.status}</td>
                                        <td style={{ padding: '15px 20px', background: '#fff', borderTop: '1px solid #d1d5db', borderBottom: '1px solid #d1d5db' }}>{lead.type || '-'}</td>
                                        <td style={{ padding: '15px 20px', background: '#fff', borderTop: '1px solid #d1d5db', borderBottom: '1px solid #d1d5db', borderRight: '1px solid #d1d5db', borderTopRightRadius: '10px', borderBottomRightRadius: '10px' }}>{lead.scheduledDate ? new Date(lead.scheduledDate).toLocaleDateString() : '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>{renderPagination()}</div>
                </div>

                {/* Manual Lead Modal */}
                {showManualModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                        <div style={{ background: '#fff', padding: '30px', borderRadius: '15px', width: '400px' }}>
                            <h3>Add New Lead</h3>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const data = new FormData(e.target);
                                try {
                                    await api.post('/leads/manual', Object.fromEntries(data));
                                    setShowManualModal(false);
                                    fetchLeads();
                                } catch (error) { alert('Failed'); }
                            }}>
                                <input name="name" placeholder="Name" required style={{ width: '100%', margin: '10px 0', padding: '10px' }} />
                                <input name="email" placeholder="Email" required style={{ width: '100%', margin: '10px 0', padding: '10px' }} />
                                <input name="location" placeholder="Location" style={{ width: '100%', margin: '10px 0', padding: '10px' }} />
                                <input name="language" placeholder="Language" style={{ width: '100%', margin: '10px 0', padding: '10px' }} />
                                <button type="submit" style={{ width: '100%', padding: '10px', background: '#3154f3', color: '#fff', border: 'none' }}>Save</button>
                                <button type="button" onClick={() => setShowManualModal(false)} style={{ width: '100%', marginTop: '10px', padding: '10px', background: '#ccc', border: 'none' }}>Cancel</button>
                            </form>
                        </div>
                    </div>
                )}

                {/* CSV Modal */}
                {showCSVModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                        <div style={{ background: '#fff', padding: '30px', borderRadius: '15px', width: '400px' }}>
                            <h3>Upload CSV</h3>
                            <input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files[0])} style={{ margin: '20px 0' }} />
                            {uploading && <div>Uploading: {uploadProgress}%</div>}
                            <button onClick={handleCSVUpload} disabled={!csvFile || uploading} style={{ width: '100%', padding: '10px', background: '#000', color: '#fff', border: 'none' }}>Upload</button>
                            <button onClick={() => setShowCSVModal(false)} style={{ width: '100%', marginTop: '10px', padding: '10px', background: '#ccc', border: 'none' }}>Cancel</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Leads;
