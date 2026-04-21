import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FiCheckCircle, FiClock, FiLock, FiMail, FiUserPlus } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import useAuth from '../context/useAuth';
import { buildApiUrl } from '../utils/api';

const MANAGER_HOME = '/admin-dashboard';
const EMPTY_CUSTOMER_REQUEST = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  licenseNumber: '',
  address: '',
  postalCode: '',
  dateOfBirth: '',
  notes: '',
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [requestForm, setRequestForm] = useState(EMPTY_CUSTOMER_REQUEST);
  const [requestError, setRequestError] = useState('');
  const [requestSuccess, setRequestSuccess] = useState('');
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      navigate(MANAGER_HOME, { replace: true });
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
            'Authorized manager credentials are required to sign in.',
        );
        return;
      }

      login(data);
      navigate(MANAGER_HOME, { replace: true });
    } catch {
      setError('Could not connect to the backend. Start the JWT API server and try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateRequestField = (key, value) => {
    setRequestForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleCustomerRequest = async (event) => {
    event.preventDefault();
    setRequestError('');
    setRequestSuccess('');

    if (requestForm.password.length < 8) {
      setRequestError('Use a password with at least 8 characters.');
      return;
    }

    if (requestForm.password !== requestForm.confirmPassword) {
      setRequestError('Password confirmation does not match.');
      return;
    }

    setRequestSubmitting(true);

    try {
      const response = await fetch(buildApiUrl('/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: requestForm.name,
          email: requestForm.email,
          phone: requestForm.phone,
          password: requestForm.password,
          address: requestForm.address,
          postalCode: requestForm.postalCode,
          dateOfBirth: requestForm.dateOfBirth,
          licenseNumber: requestForm.licenseNumber,
          notes: requestForm.notes,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setRequestError(data.message || 'Could not submit the customer access request.');
        return;
      }

      setRequestSuccess(
        data.message ||
          'Your request has been sent. The manager will review it and approve your account.',
      );
      setRequestForm(EMPTY_CUSTOMER_REQUEST);
    } catch {
      setRequestError('Could not connect to the backend. Start the API server and try again.');
    } finally {
      setRequestSubmitting(false);
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
                Customer Request
              </span>
              <h1 className="fw-bold display-6 mb-3">Request your customer account.</h1>
              <div className="rounded-4 p-3" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="small text-white-50">
                  Fill in your details once.
                  <br />
                  The manager will review your request.
                  <br />
                  After approval, your account will be activated.
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="card border-0 shadow-lg rounded-5 h-100">
              <div className="card-body p-4 p-md-5">
                <div className="mb-4">
                  <p className="text-uppercase small fw-bold text-danger mb-2">Manage your Login</p>
                  <h2 className="fw-bold mb-2">Authorized account access</h2>
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

                  <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-3">
                    <button
                      className="btn btn-dark rounded-pill fw-bold px-4 py-3"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? 'Signing in...' : 'Login'}
                    </button>
                  </div>
                </form>

                <div className="border-top mt-5 pt-4">
                  <div className="d-flex align-items-center gap-2 fw-bold mb-2">
                    <FiUserPlus className="text-danger" />
                    Customer Access Request
                  </div>
                  <p className="text-muted mb-4">
                    Fill in your details once. The manager will review your request and activate
                    your account after approval.
                  </p>

                  {requestSuccess ? (
                    <div className="alert alert-success rounded-4 border-0">
                      <div className="d-flex align-items-start gap-3">
                        <FiCheckCircle size={20} className="mt-1 flex-shrink-0" />
                        <div className="small">{requestSuccess}</div>
                      </div>
                    </div>
                  ) : null}

                  {requestError ? (
                    <div className="alert alert-danger rounded-4">{requestError}</div>
                  ) : null}

                  <form onSubmit={handleCustomerRequest}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Full Name</label>
                        <input
                          type="text"
                          className="form-control rounded-4"
                          value={requestForm.name}
                          onChange={(event) => updateRequestField('name', event.target.value)}
                          placeholder="Customer name"
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Email</label>
                        <input
                          type="email"
                          className="form-control rounded-4"
                          value={requestForm.email}
                          onChange={(event) => updateRequestField('email', event.target.value)}
                          placeholder="name@example.com"
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Phone</label>
                        <input
                          type="text"
                          className="form-control rounded-4"
                          value={requestForm.phone}
                          onChange={(event) => updateRequestField('phone', event.target.value)}
                          placeholder="+94 77 123 4567"
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">License / NIC</label>
                        <input
                          type="text"
                          className="form-control rounded-4"
                          value={requestForm.licenseNumber}
                          onChange={(event) =>
                            updateRequestField('licenseNumber', event.target.value)
                          }
                          placeholder="License or NIC"
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Date of Birth</label>
                        <input
                          type="date"
                          className="form-control rounded-4"
                          value={requestForm.dateOfBirth}
                          onChange={(event) => updateRequestField('dateOfBirth', event.target.value)}
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Postal Code</label>
                        <input
                          type="text"
                          className="form-control rounded-4"
                          value={requestForm.postalCode}
                          onChange={(event) => updateRequestField('postalCode', event.target.value)}
                          placeholder="Postal"
                          required
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label fw-semibold">Address</label>
                        <input
                          type="text"
                          className="form-control rounded-4"
                          value={requestForm.address}
                          onChange={(event) => updateRequestField('address', event.target.value)}
                          placeholder="Street, town, and district"
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Password</label>
                        <input
                          type="password"
                          className="form-control rounded-4"
                          value={requestForm.password}
                          onChange={(event) => updateRequestField('password', event.target.value)}
                          placeholder="Create a password"
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Confirm Password</label>
                        <input
                          type="password"
                          className="form-control rounded-4"
                          value={requestForm.confirmPassword}
                          onChange={(event) =>
                            updateRequestField('confirmPassword', event.target.value)
                          }
                          placeholder="Repeat password"
                          required
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label fw-semibold">Notes</label>
                        <input
                          type="text"
                          className="form-control rounded-4"
                          value={requestForm.notes}
                          onChange={(event) => updateRequestField('notes', event.target.value)}
                          placeholder="Trip details, branch preference, rental purpose..."
                        />
                      </div>
                    </div>

                    <div className="rounded-4 border bg-light p-4 mt-4 mb-4">
                      <div className="d-flex align-items-center gap-2 fw-semibold mb-2">
                        <FiClock className="text-danger" />
                        What happens next
                      </div>
                      <div className="small text-muted">
                        Your request is sent for review. Once the manager approves it, your
                        customer account becomes active.
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={requestSubmitting}
                      className="btn btn-danger rounded-pill fw-bold px-4 py-3"
                    >
                      {requestSubmitting ? 'Submitting request...' : 'Submit Request'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
