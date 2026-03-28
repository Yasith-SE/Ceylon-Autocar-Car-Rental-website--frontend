import { FiSearch, FiUser, FiLogOut, FiSettings } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext"; // Import Auth Context

const Navbar = () => {
    const { user, logout } = useAuth(); // Get global user state
    const navigate = useNavigate();
    
    // State to handle the dropdown menu toggle
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown if user clicks outside of it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout(); // Clear user from context
        setShowDropdown(false);
        navigate("/login"); // Redirect to login page
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm px-4 py-3 fixed-top">
            <div className="container-fluid">
                <Link className="navbar-brand fw-bold fs-3" to="/">
                    <span style={{ color: '#e74c3c' }}>Ceylon</span> AutoCar
                </Link>
                
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>
                
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-4 fw-medium">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/available">Available Cars</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/category">Category</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/dealership">Dealership</Link>
                        </li>
                    </ul>

                    <div className="d-flex align-items-center gap-4">
                        <FiSearch className="fs-5 text-dark" style={{ cursor: 'pointer' }} />
                        
                        {/* --- CONDITIONAL RENDERING FOR AUTH --- */}
                        {!user ? (
                            // Show these if NO user is logged in
                            <div className="d-flex gap-2">
                                <Link to="/login" className="btn btn-outline-danger rounded-pill px-4 py-2 fw-semibold">
                                    Login
                                </Link>
                                <Link to="/signup" className="btn btn-danger rounded-pill px-4 py-2 fw-semibold">
                                    Sign Up
                                </Link>
                            </div>
                        ) : (
                            // Show this if user IS logged in
                            <div className="position-relative" ref={dropdownRef}>
                                <button 
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center border shadow-sm"
                                    style={{ width: '45px', height: '45px' }}
                                >
                                    <FiUser size={22} className="text-dark" />
                                </button>

                                {/* Dropdown Menu */}
                                {showDropdown && (
                                    <div 
                                        className="position-absolute bg-white shadow-lg rounded-3 py-2 mt-2" 
                                        style={{ right: 0, width: '220px', zIndex: 1050, border: '1px solid #eee' }}
                                    >
                                        {/* User Info Header */}
                                        <div className="px-3 py-2 border-bottom mb-2 bg-light">
                                            <p className="m-0 fw-bold text-dark">{user.name || "My Account"}</p>
                                            <small className="text-muted" style={{ fontSize: '0.8rem' }}>
                                                Logged in as {user.role === 'ADMIN' ? 'Administrator' : 'Customer'}
                                            </small>
                                        </div>

                                        {/* Standard Links */}
                                        <Link to="/profile" className="dropdown-item py-2 px-3 d-flex align-items-center gap-2" onClick={() => setShowDropdown(false)}>
                                            <FiUser className="text-secondary" /> My Profile
                                        </Link>

                                        {/* Admin Only Link */}
                                        {user.role === 'ADMIN' && (
                                            <Link to="/admin-dashboard" className="dropdown-item py-2 px-3 d-flex align-items-center gap-2 text-primary" onClick={() => setShowDropdown(false)}>
                                                <FiSettings className="text-primary" /> Admin Panel
                                            </Link>
                                        )}

                                        <div className="dropdown-divider my-2"></div>

                                        {/* Logout Button */}
                                        <button 
                                            onClick={handleLogout}
                                            className="dropdown-item py-2 px-3 d-flex align-items-center gap-2 text-danger fw-semibold"
                                        >
                                            <FiLogOut className="text-danger" /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;