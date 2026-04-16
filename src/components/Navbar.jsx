import {
  FiCompass,
  FiLogOut,
  FiMessageCircle,
  FiSearch,
  FiSettings,
  FiShield,
  FiUser,
} from 'react-icons/fi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import useAuth from '../context/useAuth';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/available', label: 'Available Cars' },
  { to: '/category', label: 'Category' },
  { to: '/dealership', label: 'Dealership' },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/login');
  };

  return (
    <nav
      className="navbar navbar-expand-lg fixed-top"
      style={{
        backdropFilter: 'blur(18px)',
        background: 'rgba(255, 255, 255, 0.9)',
        borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
      }}
    >
      <div className="container-fluid px-4 px-xl-5 py-3">
        <Link className="navbar-brand fw-bold d-flex flex-column lh-sm me-4" to="/">
          <span style={{ fontSize: '2rem' }}>
            <span style={{ color: '#ef4444' }}>Ceylon</span> AutoCar
          </span>
          <small className="text-muted" style={{ fontSize: '0.76rem', letterSpacing: '0.2em' }}>
            PREMIUM RENTAL GARAGE
          </small>
        </Link>

        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mx-auto mb-3 mb-lg-0 gap-lg-3">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.to === '/'
                  ? location.pathname === link.to
                  : location.pathname.startsWith(link.to);

              return (
                <li key={link.to} className="nav-item">
                  <Link
                    className={`nav-link fw-semibold px-3 py-2 rounded-pill ${
                      isActive ? 'text-dark bg-dark bg-opacity-10' : 'text-secondary'
                    }`}
                    to={link.to}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="d-flex align-items-center gap-2 gap-lg-3">
            <button
              type="button"
              onClick={() => navigate('/available')}
              className="btn btn-light border rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '46px', height: '46px' }}
              aria-label="Browse fleet"
            >
              <FiSearch size={20} />
            </button>

            {!user ? (
              <div className="d-flex flex-column flex-sm-row gap-2">
                <Link to="/login" className="btn btn-outline-dark rounded-pill px-4 fw-semibold">
                  Login
                </Link>
                <Link to="/signup" className="btn btn-danger rounded-pill px-4 fw-semibold">
                  Register
                </Link>
              </div>
            ) : (
              <>
                <div className="d-none d-lg-flex flex-column align-items-end lh-sm me-1">
                  <span className="fw-semibold text-dark">{user.name || 'Account'}</span>
                  <small className="text-muted">
                    {user.role === 'ADMIN' ? 'Administrator' : 'Customer account'}
                  </small>
                </div>

                <div className="position-relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown((current) => !current)}
                    className="btn btn-light rounded-circle d-flex align-items-center justify-content-center border shadow-sm"
                    style={{ width: '48px', height: '48px' }}
                    aria-label="Open account menu"
                  >
                    <FiUser size={21} />
                  </button>

                  {showDropdown && (
                    <div
                      className="position-absolute end-0 mt-2 p-2 rounded-4 shadow-lg"
                      style={{
                        width: '280px',
                        zIndex: 1100,
                        background: 'rgba(255,255,255,0.96)',
                        border: '1px solid rgba(15, 23, 42, 0.08)',
                      }}
                    >
                      <div className="p-3 rounded-4 bg-dark text-white mb-2">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <span className="fw-bold">{user.name || 'Garage User'}</span>
                          <span className="badge rounded-pill bg-danger-subtle text-danger">
                            {user.role}
                          </span>
                        </div>
                        <small className="text-white-50">
                          {user.role === 'ADMIN'
                            ? 'Manage cars, customer credentials, and the rental operation.'
                            : 'Inspect cars in 3D and send staff-assisted rental requests.'}
                        </small>
                      </div>

                      <Link
                        to="/profile"
                        className="dropdown-item rounded-3 py-2 px-3 d-flex align-items-center gap-2"
                        onClick={() => setShowDropdown(false)}
                      >
                        <FiUser /> My Profile
                      </Link>

                      {user.role === 'ADMIN' && (
                        <>
                          <Link
                            to="/admin-dashboard"
                            className="dropdown-item rounded-3 py-2 px-3 d-flex align-items-center gap-2"
                            onClick={() => setShowDropdown(false)}
                          >
                            <FiSettings /> Admin Dashboard
                          </Link>
                          <Link
                            to="/admin/upload-car"
                            className="dropdown-item rounded-3 py-2 px-3 d-flex align-items-center gap-2"
                            onClick={() => setShowDropdown(false)}
                          >
                            <FiShield /> Upload New Vehicle
                          </Link>
                          <Link
                            to="/admin/support-chat"
                            className="dropdown-item rounded-3 py-2 px-3 d-flex align-items-center gap-2"
                            onClick={() => setShowDropdown(false)}
                          >
                            <FiMessageCircle /> Support Chat Desk
                          </Link>
                        </>
                      )}

                      {user.role === 'CUSTOMER' && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowDropdown(false);
                            navigate('/available');
                          }}
                          className="dropdown-item rounded-3 py-2 px-3 d-flex align-items-center gap-2"
                        >
                          <FiCompass /> Request a Rental
                        </button>
                      )}

                      <hr className="my-2" />

                      <button
                        onClick={handleLogout}
                        className="dropdown-item rounded-3 py-2 px-3 d-flex align-items-center gap-2 text-danger fw-semibold"
                      >
                        <FiLogOut /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
