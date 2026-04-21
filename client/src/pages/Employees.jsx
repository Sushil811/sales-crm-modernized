import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [page, setPage] = useState(1);
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [newEmp, setNewEmp] = useState({ firstName: '', lastName: '', email: '', location: '', language: '' });
    const [totalPages, setTotalPages] = useState(1);

    const fetchEmployees = useCallback(async () => {
        try {
            const res = await api.get(`/employees?search=${search}&page=${page}`);
            setEmployees(res.data?.employees || []);
            setTotalPages(res.data?.totalPages || 1);
        } catch (error) {
            console.error('Fetch Employees Error:', error);
        }
    }, [search, page]);

    useEffect(() => {
        const timer = setTimeout(fetchEmployees, 300);
        return () => clearTimeout(timer);
    }, [fetchEmployees]);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const payload = { 
                ...newEmp, 
                name: `${newEmp.firstName} ${newEmp.lastName}`,
                department: newEmp.location // Mapping Location UI field to Department DB field
            };
            if (editingId) {
                await api.patch(`/employees/${editingId}`, payload);
            } else {
                await api.post('/employees', payload);
            }
            closeModal();
            fetchEmployees();
        } catch (error) {
            alert(error.response?.data?.message || 'Error saving');
        }
    };

    const handleEdit = (emp) => {
        setNewEmp({ 
            firstName: emp.firstName || '', 
            lastName: emp.lastName || '', 
            email: emp.email || '', 
            location: emp.department || '', 
            language: emp.language || '' 
        });
        setEditingId(emp._id);
        setShowModal(true);
        setActiveMenuId(null);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
        setNewEmp({ firstName: '', lastName: '', email: '', location: '', language: '' });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this employee?')) {
            try {
                await api.delete(`/employees/${id}`);
                fetchEmployees();
                setActiveMenuId(null);
            } catch (error) { 
                console.error('Delete Error:', error);
                alert('Delete failed'); 
            }
        }
    };

    const handleBulkDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${selectedIds.length} employees?`)) {
            try {
                await api.post('/employees/bulk-delete', { ids: selectedIds });
                setSelectedIds([]);
                fetchEmployees();
            } catch (error) { 
                console.error('Bulk Delete Error:', error);
                alert('Bulk delete failed'); 
            }
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === employees.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(employees.map(e => e._id));
        }
    };

    const toggleSelectOne = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const renderPagination = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) pages.push(i);
        return (
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', justifyContent: 'center', marginTop: '40px' }}>
                <button 
                    className="pag-btn" 
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p-1))} 
                    style={{ 
                        padding: '10px 20px', borderRadius: '10px', border: '1.5px solid #eee', 
                        background: '#fff', fontWeight: 700, cursor: page === 1 ? 'default' : 'pointer', 
                        opacity: page === 1 ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '8px' 
                    }}
                >
                    <span style={{ fontSize: '1.1rem' }}>←</span> Previous
                </button>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {pages.map((p) => (
                        <button key={p} onClick={() => setPage(p)} style={{ width: '40px', height: '40px', borderRadius: '10px', border: 'none', background: p === page ? '#ebf0ff' : 'transparent', color: p === page ? '#3154f3' : '#666', fontWeight: 800, cursor: 'pointer' }}>{p}</button>
                    ))}
                </div>
                <button 
                    className="pag-btn" 
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p+1))} 
                    style={{ 
                        padding: '10px 20px', borderRadius: '10px', border: '1.5px solid #eee', 
                        background: '#fff', fontWeight: 700, cursor: page === totalPages ? 'default' : 'pointer', 
                        opacity: page === totalPages ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '8px' 
                    }}
                >
                    Next <span style={{ fontSize: '1.1rem' }}>→</span>
                </button>
            </div>
        );
    };

    return (
        <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '0 0 50px 0', fontFamily: "'Outfit', sans-serif" }}>
            {/* Top Header with Repositioned Search */}
            <div style={{ background: '#fff', padding: '20px 50px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
                    <input 
                        placeholder="Search here..."
                        style={{ width: '100%', padding: '14px 20px 14px 50px', borderRadius: '15px', background: '#f0f0f0', border: 'none', fontSize: '0.95rem', outline: 'none', fontWeight: 500, color: '#444' }}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: '#999' }}>
                        Home <span style={{ opacity: 0.4, margin: '0 10px' }}>›</span> <span style={{ color: '#1a1a1a' }}>Employees</span>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        {selectedIds.length > 0 && (
                            <button onClick={handleBulkDelete} style={{ padding: '14px 28px', borderRadius: '14px', background: '#fee2e2', border: 'none', fontWeight: 700, cursor: 'pointer', color: '#ef4444' }}>Delete ({selectedIds.length})</button>
                        )}
                        <button onClick={() => setShowModal(true)} style={{ padding: '14px 35px', borderRadius: '14px', background: '#e0e0e0', border: 'none', fontWeight: 700, cursor: 'pointer', color: '#666', fontSize: '1rem' }}>Add Employees</button>
                    </div>
                </div>

                <div style={{ background: '#fff', borderRadius: '35px', border: '1.5px solid #f0f0f0', padding: '30px', boxShadow: '0 10px 40px rgba(0,0,0,0.02)', minHeight: '650px' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 15px' }}>
                            <thead>
                                <tr style={{ color: '#888', fontSize: '0.85rem', fontWeight: 700, textAlign: 'left' }}>
                                    <th style={{ padding: '0 20px', width: '50px' }}>
                                        <input 
                                            type="checkbox" 
                                            style={{ transform: 'scale(1.2)' }} 
                                            checked={employees.length > 0 && selectedIds.length === employees.length}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th style={{ padding: '0 20px' }}>Name</th>
                                    <th style={{ padding: '0 20px' }}>Employee ID</th>
                                    <th style={{ padding: '0 20px' }}>Assigned Leads</th>
                                    <th style={{ padding: '0 20px' }}>Closed Leads</th>
                                    <th style={{ padding: '0 20px' }}>Status</th>
                                    <th style={{ padding: '0 20px', width: '50px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map((emp) => (
                                    <tr key={emp._id} style={{ transition: '0.2s', position: 'relative' }}>
                                        <td style={{ padding: '20px', background: '#fff', border: '1.2px solid #f0f0f0', borderRight: 'none', borderTopLeftRadius: '18px', borderBottomLeftRadius: '18px' }}>
                                            <input 
                                                type="checkbox" 
                                                style={{ transform: 'scale(1.2)', opacity: selectedIds.includes(emp._id) ? 1 : 0.3 }} 
                                                checked={selectedIds.includes(emp._id)}
                                                onChange={() => toggleSelectOne(emp._id)}
                                            />
                                        </td>
                                        <td style={{ padding: '20px', background: '#fff', borderTop: '1.2px solid #f0f0f0', borderBottom: '1.2px solid #f0f0f0' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#ffefeb', color: '#ff7a5c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
                                                    {emp.firstName?.charAt(0)}{emp.lastName?.charAt(0)}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1a1a1a' }}>{emp.firstName} {emp.lastName}</div>
                                                    <div style={{ fontSize: '0.85rem', color: '#999', fontWeight: 600 }}>@{emp.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px', background: '#fff', borderTop: '1.2px solid #f0f0f0', borderBottom: '1.2px solid #f0f0f0' }}>
                                            <div style={{ display: 'inline-block', padding: '6px 14px', borderRadius: '10px', background: '#f8f9ff', color: '#3154f3', fontSize: '0.8rem', fontWeight: 800 }}>
                                                #{emp.employeeId || '23454GH6J7YT6'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px', background: '#fff', borderTop: '1.2px solid #f0f0f0', borderBottom: '1.2px solid #f0f0f0', fontWeight: 700, color: '#444' }}>5</td>
                                        <td style={{ padding: '20px', background: '#fff', borderTop: '1.2px solid #f0f0f0', borderBottom: '1.2px solid #f0f0f0', fontWeight: 700, color: '#444' }}>2</td>
                                        <td style={{ padding: '20px', background: '#fff', borderTop: '1.2px solid #f0f0f0', borderBottom: '1.2px solid #f0f0f0' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: '#ebfdf5', color: '#10b981', width: 'fit-content', fontSize: '0.85rem', fontWeight: 800 }}>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></div>
                                                Active
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px', background: '#fff', borderTopRightRadius: '18px', borderBottomRightRadius: '18px', border: '1.2px solid #f0f0f0', borderLeft: 'none', textAlign: 'center', position: 'relative' }}>
                                            <button 
                                                onClick={() => setActiveMenuId(activeMenuId === emp._id ? null : emp._id)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#ccc', fontWeight: 'bold' }}
                                            >⋮</button>
                                            
                                            {activeMenuId === emp._id && (
                                                <div style={{ position: 'absolute', top: '70%', right: '20px', background: '#fff', boxShadow: '0 15px 40px rgba(0,0,0,0.1)', borderRadius: '15px', padding: '10px', zIndex: 10, width: '140px', border: '1px solid #eee' }}>
                                                    <button onClick={() => handleEdit(emp)} style={{ width: '100%', padding: '10px', textAlign: 'left', background: 'none', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700, color: '#444', cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center' }} onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                                                        <span>✎</span> Edit
                                                    </button>
                                                    <button onClick={() => handleDelete(emp._id)} style={{ width: '100%', padding: '10px', textAlign: 'left', background: '#f5f5f5', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700, color: '#444', cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center' }} onMouseEnter={e => e.currentTarget.style.background = '#eee'} onMouseLeave={e => e.currentTarget.style.background = '#f5f5f5'}>
                                                        <span>🗑</span> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {renderPagination()}
                </div>
            </div>

            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.3s' }}>
                    <div style={{ background: '#fff', borderRadius: '30px', padding: '45px', width: '100%', maxWidth: '750px', boxShadow: '0 40px 100px rgba(0,0,0,0.2)', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                            <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, color: '#1a1a1a' }}>{editingId ? 'Edit Employee' : 'Add New Employee'}</h2>
                            <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }}>×</button>
                        </div>
                        <form onSubmit={handleSave} style={{ display: 'grid', gap: '25px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#444' }}>First name</label>
                                <input value={newEmp.firstName} onChange={e => setNewEmp({...newEmp, firstName: e.target.value})} required style={{ padding: '14px 20px', borderRadius: '12px', border: '1.5px solid #ccc', fontSize: '1rem', outline: 'none' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#444' }}>Last name</label>
                                <input value={newEmp.lastName} onChange={e => setNewEmp({...newEmp, lastName: e.target.value})} required style={{ padding: '14px 20px', borderRadius: '12px', border: '1.5px solid #ccc', fontSize: '1rem', outline: 'none' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#444' }}>Email</label>
                                <input type="email" value={newEmp.email} onChange={e => setNewEmp({...newEmp, email: e.target.value})} required style={{ padding: '14px 20px', borderRadius: '12px', border: '1.5px solid #ccc', fontSize: '1rem', outline: 'none' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#444' }}>Location</label>
                                <input value={newEmp.location} onChange={e => setNewEmp({...newEmp, location: e.target.value})} style={{ padding: '14px 20px', borderRadius: '12px', border: '1.5px solid #ccc', fontSize: '1rem', outline: 'none' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#444' }}>Preferred Language</label>
                                <div style={{ position: 'relative' }}>
                                    <input value={newEmp.language} onChange={e => setNewEmp({...newEmp, language: e.target.value})} style={{ width: '100%', padding: '14px 20px', borderRadius: '12px', border: '1.5px solid #ccc', fontSize: '1rem', outline: 'none' }} />
                                    <span style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>ⓘ</span>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                                <button type="submit" style={{ padding: '18px 60px', background: '#d6d6d6', color: '#666', border: 'none', borderRadius: '15px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#ccc'} onMouseLeave={e => e.currentTarget.style.background = '#d6d6d6'}>Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .pag-btn:hover { background: #fdfdfd !important; border-color: #ddd !important; }
            `}</style>
        </div>
    );
};

export default Employees;
