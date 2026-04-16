import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { FiSearch, FiTrash2, FiShield, FiUser } from 'react-icons/fi';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    // Fetch all users on load
    const fetchUsers = () => {
        setLoading(true);
        fetch('http://localhost:8081/api/admin/users')
            .then(res => res.json())
            .then(data => {
                setUsers(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Handle Role Change
    const handleRoleChange = async (id, currentRole) => {
        const newRole = currentRole === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';
        if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

        try {
            const response = await fetch(`http://localhost:8080/api/admin/users/${id}/role?role=${newRole}`, {
                method: 'PUT'
            });
            if (response.ok) {
                alert(`User role updated to ${newRole}`);
                fetchUsers(); // Refresh the table
            }
        } catch (error) {
            alert("Failed to update role.");
        }
    };

    // Handle User Deletion
    const handleDelete = async (id, name) => {
        if (!window.confirm(`WARNING: Are you sure you want to permanently delete ${name}?`)) return;

        try {
            const response = await fetch(`http://localhost:8080/api/admin/users/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                alert("User deleted successfully.");
                fetchUsers(); // Refresh the table
            }
        } catch (error) {
            alert("Failed to delete user.");
        }
    };

    // Search Filter
    const filteredUsers = users.filter(u => 
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-light min-vh-100 pb-5">
            <Navbar />
            <div className="container" style={{ marginTop: '100px' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="fw-bold m-0">User Management</h2>
                    <div className="input-group" style={{ width: '300px' }}>
                        <span className="input-group-text bg-white border-end-0"><FiSearch /></span>
                        <input 
                            type="text" 
                            className="form-control border-start-0" 
                            placeholder="Search name or email..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle m-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="px-4 py-3 border-0">User Details</th>
                                    <th className="py-3 border-0">Address</th>
                                    <th className="py-3 border-0 text-center">Current Role</th>
                                    <th className="px-4 py-3 border-0 text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="4" className="text-center py-5"><div className="spinner-border text-danger"></div></td></tr>
                                ) : filteredUsers.length > 0 ? (
                                    filteredUsers.map(user => (
                                        <tr key={user.id}>
                                            <td className="px-4 py-3">
                                                <div className="d-flex align-items-center gap-3">
                                                    {user.image ? (
                                                        <img src={user.image} alt="avatar" className="rounded-circle object-fit-cover" style={{width: '40px', height: '40px'}} />
                                                    ) : (
                                                        <div className="bg-secondary bg-opacity-10 text-secondary rounded-circle d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}}>
                                                            <FiUser />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="fw-bold text-dark">{user.name}</div>
                                                        <div className="small text-muted">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 text-muted small">{user.address || "N/A"}</td>
                                            <td className="py-3 text-center">
                                                <span className={`badge rounded-pill px-3 py-2 ${user.role === 'ADMIN' ? 'bg-dark' : 'bg-primary'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-end">
                                                <button 
                                                    onClick={() => handleRoleChange(user.id, user.role)}
                                                    className="btn btn-sm btn-outline-dark rounded-pill px-3 me-2"
                                                    title="Toggle Role"
                                                >
                                                    <FiShield className="me-1" /> 
                                                    {user.role === 'ADMIN' ? 'Make Customer' : 'Make Admin'}
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(user.id, user.name)}
                                                    className="btn btn-sm btn-danger rounded-pill px-3"
                                                    title="Delete User"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="4" className="text-center py-5 text-muted">No users found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageUsers;