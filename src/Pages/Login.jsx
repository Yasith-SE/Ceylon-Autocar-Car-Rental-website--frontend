import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FiLock, FiMail, FiShield } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import useAuth from '../context/useAuth';
import { buildApiUrl } from '../utils/api';

const getHomeForRole = (role) =>
  role === 'ADMIN' ? '/admin-dashboard' : '/available';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role) {
      navigate(getHomeForRole(user.role), { replace: true });
    }
  }, [navigate, user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(buildApiUrl('/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(
          data.message ||
            'Invalid email or password. Please check your credentials and try again.',
        );
        return;
      }

      login(data);
      navigate(getHomeForRole(data.user.role), { replace: true });
    } catch {
      setError('Could not connect to the backend. Start the JWT API server and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100"
      style={{
        background:
          'linear-gradient(135deg, rgba(15,23,42,0.04), rgba(239,68,68,0.08), rgba(37,99,235,0.06))',
      }}
    >
      <Navbar />

      <div className="container" style={{ paddingTop: '140px', paddingBottom: '48px' }}>
        <div className="row g-4 align-items-stretch">
          <div className="col-lg-5">
            <div
              className="h-100 rounded-5 overflow-hidden text-white p-4 p-md-5 d-flex flex-column justify-content-end"
              style={{
                minHeight: '560px',
                background:
                  'linear-gradient(180deg, rgba(15,23,42,0.2), rgba(15,23,42,0.9)), url(https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2080&auto=format&fit=crop) center/cover',
              }}
            >
              <span className="badge rounded-pill text-bg-danger align-self-start mb-3">
                Secure Staff + Customer Access
              </span>
              <h1 className="fw-bold display-6 mb-3">Sign in with your registered account.</h1>
              <p className="mb-3 text-white-50">
                Admin and employee accounts can register and start using the dashboard right away.
                Customer accounts must be approved by a manager before they can log in.
              </p>
              <div className="d-grid gap-3">
                <div className="rounded-4 p-3" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="d-flex align-items-center gap-2 fw-semibold mb-2">
                    <FiShield /> JWT-secured access
                  </div>
                  <div className="small text-white-50">
                    The backend now decides the real role. Customers cannot sign in as admins by
                    changing the UI.
                  </div>
                </div>
                <div className="rounded-4 p-3" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="fw-semibold mb-2">Staff accounts</div>
                  <div className="small text-white-50">
                    Employees, managers, and fleet managers use approved admin credentials with
                    full access.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="card border-0 shadow-lg rounded-5 h-100">
              <div className="card-body p-4 p-md-5">
                <div className="mb-4">
                  <p className="text-uppercase small fw-bold text-danger mb-2">Account Login</p>
                  <h2 className="fw-bold mb-2">Email and password</h2>
                  <p className="text-muted mb-0">
                    Enter your account credentials. The backend will route admins to the dashboard
                    and customers to the rental fleet.
                  </p>
                </div>

                {error ? <div className="alert alert-danger rounded-4">{error}</div> : null}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Email</label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text bg-white border-end-0 rounded-start-4">
                        <FiMail />
                      </span>
                      <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="form-control border-start-0 rounded-end-4"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Password</label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text bg-white border-end-0 rounded-start-4">
                        <FiLock />
                      </span>
                      <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="form-control border-start-0 rounded-end-4"
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                  </div>

                  <div className="rounded-4 border bg-light p-4 mb-4">
                    <div className="fw-semibold mb-2">Access rules</div>
                    <div className="small text-muted">
                      Admin and employee accounts can sign in immediately after registration.
                      Customer registrations stay blocked until a manager approves them from user
                      management.
                    </div>
                  </div>

                  <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-3">
                    <button
                      className="btn btn-dark rounded-pill fw-bold px-4 py-3"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? 'Signing in...' : 'Login'}
                    </button>

                    <span className="text-muted small">
                      Need a customer account?{' '}
                      <Link to="/signup" className="text-decoration-none fw-semibold text-dark">
                        Register here
                      </Link>
                    </span>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
