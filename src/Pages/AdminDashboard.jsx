import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { FiUsers, FiActivity, FiMonitor, FiSearch, FiClock } from 'react-icons/fi';

const AdminDashboard = () => {
    const [loginLogs, setLoginLogs] = useState([]);
    const [stats, setStats] = useState({ totalUsers: 0, totalLogins: 0, activeRentals: 0 });
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch Stats
        fetch('http://localhost:8080/api/admin/stats')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error(err));

        // Fetch Audit Logs
        fetch('http://localhost:8080/api/admin/login-history')
            .then(res => res.json())
            .then(data => {
                setLoginLogs(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    // Filter logs based on search term
    const filteredLogs = loginLogs.filter(log => 
        log.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ip.includes(searchTerm) ||
        log.device.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-light min-vh-100">
            <Navbar />
            <div className="container" style={{ marginTop: '100px', paddingBottom: '50px' }}>
                <h2 className="fw-bold mb-4">Admin Control Center</h2>
                
                {/* --- STATS ROW --- */}
                <div className="row g-4 mb-5">
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm rounded-4 p-4 d-flex flex-row align-items-center gap-3">
                            <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary"><FiUsers size={28} /></div>
                            <div>
                                <h3 className="fw-bold m-0">{stats.totalUsers}</h3>
                                <span className="text-muted small">Total Registered Users</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm rounded-4 p-4 d-flex flex-row align-items-center gap-3">
                            <div className="bg-danger bg-opacity-10 p-3 rounded-circle text-danger"><FiActivity size={28} /></div>
                            <div>
                                <h3 className="fw-bold m-0">{stats.activeRentals}</h3>
                                <span className="text-muted small">Active Rentals</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm rounded-4 p-4 d-flex flex-row align-items-center gap-3">
                            <div className="bg-success bg-opacity-10 p-3 rounded-circle text-success"><FiMonitor size={28} /></div>
                            <div>
                                <h3 className="fw-bold m-0">{stats.totalLogins}</h3>
                                <span className="text-muted small">Total Login Events</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- LOGIN HISTORY AUDIT LOG --- */}
                <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center rounded-top-4">
                        <h5 className="fw-bold m-0 d-flex align-items-center gap-2"><FiClock /> Login History & Audit Logs</h5>
                        <div className="input-group" style={{ width: '300px' }}>
                            <span className="input-group-text bg-light border-end-0"><FiSearch /></span>
                            <input 
                                type="text" 
                                className="form-control bg-light border-start-0" 
                                placeholder="Search Name, IP, or Device..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="card-body p-0 overflow-auto">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light text-muted small">
                                <tr>
                                    <th className="px-4 py-3 border-0">User Name</th>
                                    <th className="py-3 border-0">Date & Time</th>
                                    <th className="py-3 border-0">IP Address</th>
                                    <th className="py-3 border-0">Device Details</th>
                                    <th className="px-4 py-3 border-0 text-end">Access Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border text-danger"></div></td></tr>
                                ) : filteredLogs.length > 0 ? (
                                    filteredLogs.map(log => (
                                        <tr key={log.id}>
                                            <td className="px-4 py-3 fw-semibold">{log.name}</td>
                                            {/* Format the Java LocalDateTime array/string to a readable format */}
                                            <td className="py-3 text-muted">{new Date(log.time).toLocaleString()}</td>
                                            <td className="py-3 font-monospace small">{log.ip}</td>
                                            <td className="py-3 text-muted small">{log.device}</td>
                                            <td className="px-4 py-3 text-end">
                                                <span className={`badge rounded-pill px-3 py-2 ${log.type.includes('ADMIN') ? 'bg-dark text-white' : 'bg-danger text-white'}`}>
                                                    {log.type}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5 text-muted">No matching audit logs found.</td>
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

export default AdminDashboard;