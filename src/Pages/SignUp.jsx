import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiCheckCircle,
  FiClock,
  FiKey,
  FiMapPin,
  FiPhoneCall,
  FiShield,
  FiUserPlus,
} from 'react-icons/fi';
import Navbar from '../components/Navbar';
import useAuth from '../context/useAuth';
import { authFetch } from '../utils/api';

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  address: '',
  postalCode: '',
  dateOfBirth: '',
  licenseNumber: '',
  notes: '',
  role: 'CUSTOMER',
};

const SignUp = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const updateField = (key, value) => {
    setFormData((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const isAdminCreator = user?.role === 'ADMIN';
  const isAdminRoleSelected = formData.role === 'ADMIN';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (formData.password.length < 8) {
      setError('Use a password with at least 8 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await authFetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          address: formData.address,
          postalCode: formData.postalCode,
          dateOfBirth: formData.dateOfBirth,
          licenseNumber: formData.licenseNumber,
          notes: formData.notes,
          role: formData.role,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.message || 'We could not save the registration request right now.');
        return;
      }

      setSuccessMessage(
        data.message ||
          (isAdminCreator || isAdminRoleSelected
            ? 'Account created successfully with full access.'
            : 'Registration submitted. Wait for admin approval before logging in.'),
      );
      setFormData((current) => ({
        ...EMPTY_FORM,
        role: current.role,
      }));
    } catch {
      setError('Could not connect to the backend. Start the API server and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-vh-100"
      style={{
        background:
          'linear-gradient(135deg, rgba(15,23,42,0.03), rgba(239,68,68,0.07), rgba(16,185,129,0.06))',
      }}
    >
      <Navbar />

      <div className="container" style={{ paddingTop: '140px', paddingBottom: '48px' }}>
        <div className="row g-4 align-items-stretch">
          <div className="col-lg-7 order-lg-1">
            <div className="card border-0 shadow-lg rounded-5 h-100">
              <div className="card-body p-4 p-md-5 d-flex flex-column gap-4">
                <div>
                  <p className="text-uppercase small fw-bold text-danger mb-2">
                    {isAdminCreator ? 'User Creation' : 'Registration Queue'}
                  </p>
                  <h2 className="fw-bold mb-2">
                    {isAdminCreator ? 'Create a secure account' : 'Request secure account access'}
                  </h2>
                  <p className="text-muted mb-0">
                    {isAdminCreator
                      ? 'Create customer or staff accounts from the same UI. The backend will approve them immediately because you are signed in as an admin.'
                      : isAdminRoleSelected
                        ? 'Register an admin or employee account here. Staff accounts get full access immediately after registration.'
                        : 'Submit the form once. Customer login stays blocked until an admin approves the request.'}
                  </p>
                </div>

                {successMessage ? (
                  <div className="alert alert-success rounded-4 border-0">
                    <div className="d-flex align-items-start gap-3">
                      <FiCheckCircle size={22} className="mt-1 flex-shrink-0" />
                      <div>
                        <div className="fw-semibold mb-1">Success</div>
                        <div className="small">{successMessage}</div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {error ? <div className="alert alert-danger rounded-4">{error}</div> : null}

                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Full Name</label>
                      <input
                        type="text"
                        className="form-control form-control-lg rounded-4"
                        value={formData.name}
                        onChange={(event) => updateField('name', event.target.value)}
                        placeholder="Full name"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Email</label>
                      <input
                        type="email"
                        className="form-control form-control-lg rounded-4"
                        value={formData.email}
                        onChange={(event) => updateField('email', event.target.value)}
                        placeholder="name@example.com"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Phone Number</label>
                      <input
                        type="tel"
                        className="form-control form-control-lg rounded-4"
                        value={formData.phone}
                        onChange={(event) => updateField('phone', event.target.value)}
                        placeholder="+94 77 123 4567"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Account Category</label>
                      <select
                        className="form-select form-select-lg rounded-4"
                        value={formData.role}
                        onChange={(event) => updateField('role', event.target.value)}
                      >
                        <option value="CUSTOMER">Customer</option>
                        <option value="ADMIN">Admin / Employee</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Driving License / NIC</label>
                      <input
                        type="text"
                        className="form-control form-control-lg rounded-4"
                        value={formData.licenseNumber}
                        onChange={(event) => updateField('licenseNumber', event.target.value)}
                        placeholder="License or NIC number"
                        required={formData.role === 'CUSTOMER'}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Date of Birth</label>
                      <input
                        type="date"
                        className="form-control form-control-lg rounded-4"
                        value={formData.dateOfBirth}
                        onChange={(event) => updateField('dateOfBirth', event.target.value)}
                        required={formData.role === 'CUSTOMER'}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Password</label>
                      <input
                        type="password"
                        className="form-control form-control-lg rounded-4"
                        value={formData.password}
                        onChange={(event) => updateField('password', event.target.value)}
                        placeholder="Create a password"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Confirm Password</label>
                      <input
                        type="password"
                        className="form-control form-control-lg rounded-4"
                        value={formData.confirmPassword}
                        onChange={(event) => updateField('confirmPassword', event.target.value)}
                        placeholder="Repeat your password"
                        required
                      />
                    </div>

                    <div className="col-md-8">
                      <label className="form-label fw-semibold">Address</label>
                      <input
                        type="text"
                        className="form-control form-control-lg rounded-4"
                        value={formData.address}
                        onChange={(event) => updateField('address', event.target.value)}
                        placeholder="Street, town, and district"
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Postal Code</label>
                      <input
                        type="text"
                        className="form-control form-control-lg rounded-4"
                        value={formData.postalCode}
                        onChange={(event) => updateField('postalCode', event.target.value)}
                        placeholder="Postal"
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Purpose / Notes</label>
                      <input
                        type="text"
                        className="form-control form-control-lg rounded-4"
                        value={formData.notes}
                        onChange={(event) => updateField('notes', event.target.value)}
                        placeholder="Airport transfer, employee access, fleet operations..."
                      />
                    </div>
                  </div>

                  <div className="rounded-4 border bg-light p-4 mt-4">
                    <div className="d-flex align-items-center gap-2 fw-semibold mb-2">
                      <FiClock className="text-danger" /> Security note
                    </div>
                    <div className="small text-muted">
                      {isAdminCreator
                        ? 'Because you are logged in as an admin, the backend can create both employee and customer accounts from this form.'
                        : isAdminRoleSelected
                          ? 'Admin and employee registrations now receive full access immediately after signup.'
                          : 'Customer registrations enter a pending queue. An admin must approve them before login is allowed.'}
                    </div>
                  </div>

                  <div className="d-flex flex-column flex-sm-row gap-3 mt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn btn-danger rounded-pill fw-bold px-4 py-3"
                    >
                      {submitting
                        ? 'Submitting...'
                        : isAdminCreator
                          ? 'Create Account'
                          : isAdminRoleSelected
                            ? 'Register Admin Account'
                            : 'Submit For Approval'}
                    </button>
                    <Link
                      to="/login"
                      className="btn btn-outline-dark rounded-pill fw-bold px-4 py-3"
                    >
                      Go To Login
                    </Link>
                  </div>
                </form>

                <div className="row g-3 mt-1">
                  <div className="col-md-4">
                    <div className="rounded-4 border h-100 p-3">
                      <FiShield className="text-danger mb-3" size={22} />
                      <div className="fw-semibold mb-2">Role-protected</div>
                      <div className="text-muted small">
                        JWT tokens carry the real role from the backend, so the UI cannot promote
                        a customer to admin access.
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="rounded-4 border h-100 p-3">
                      <FiPhoneCall className="text-danger mb-3" size={22} />
                      <div className="fw-semibold mb-2">User management ready</div>
                      <div className="text-muted small">
                        Admins can create customer accounts directly and manage them from the user
                        management dashboard.
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="rounded-4 border h-100 p-3">
                      <FiMapPin className="text-danger mb-3" size={22} />
                      <div className="fw-semibold mb-2">Verified details</div>
                      <div className="text-muted small">
                        Customer address, phone, and license details stay connected to the backend
                        user record for rentals and profile management.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-5 order-lg-2">
            <div
              className="h-100 rounded-5 overflow-hidden text-white p-4 p-md-5 d-flex flex-column justify-content-end"
              style={{
                minHeight: '700px',
                background:
                  'linear-gradient(180deg, rgba(15,23,42,0.16), rgba(15,23,42,0.9)), url(https://images.unsplash.com/photo-1494905998402-395d579af36f?q=80&w=2069&auto=format&fit=crop) center/cover',
              }}
            >
              <span className="badge rounded-pill text-bg-dark align-self-start mb-3">
                JWT Registration Flow
              </span>
              <h1 className="fw-bold display-6 mb-3">
                {isAdminCreator
                  ? 'Create employees and customers from one place.'
                  : isAdminRoleSelected
                    ? 'Register staff accounts with full access.'
                    : 'Register first. Log in only after manager approval.'}
              </h1>
              <p className="mb-4 text-white-50">
                {isAdminCreator
                  ? 'Use this same UI to add customers to the system or onboard staff members. The backend decides who can create admin accounts.'
                  : isAdminRoleSelected
                    ? 'Managers, fleet managers, and employees can register here and receive immediate access to the admin side.'
                    : 'Customers can register here, but the backend keeps the account pending until an admin approves it.'}
              </p>

              <div className="d-grid gap-3">
                <div className="rounded-4 p-3" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="d-flex align-items-center gap-2 fw-semibold mb-2">
                    <FiUserPlus /> Step 1
                  </div>
                  <div className="small text-white-50">
                    Submit account details with the selected category and the required customer or
                    employee information.
                  </div>
                </div>
                <div className="rounded-4 p-3" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="d-flex align-items-center gap-2 fw-semibold mb-2">
                    <FiShield /> Step 2
                  </div>
                  <div className="small text-white-50">
                    {isAdminCreator || isAdminRoleSelected
                      ? 'Admin and employee accounts are activated immediately with full access.'
                      : 'Customer accounts stay in the pending queue until an admin reviews and approves them.'}
                  </div>
                </div>
                <div className="rounded-4 p-3" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="d-flex align-items-center gap-2 fw-semibold mb-2">
                    <FiKey /> Step 3
                  </div>
                  <div className="small text-white-50">
                    {isAdminCreator || isAdminRoleSelected
                      ? 'Registered staff members can log in right away with the same email and password.'
                      : 'Approved customers log in with the same email and password through the secure login page.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
