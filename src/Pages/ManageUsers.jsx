import { useCallback, useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import {
  FiCheckCircle,
  FiPauseCircle,
  FiPlusCircle,
  FiSearch,
  FiShield,
  FiTrash2,
  FiUser,
  FiUsers,
  FiXCircle,
} from 'react-icons/fi';
import useAuth from '../context/useAuth';
import { authFetch } from '../utils/api';

const EMPTY_FORM = {
  name: '',
  email: '',
  password: '',
  phone: '',
  licenseNumber: '',
  address: '',
  postalCode: '',
  dateOfBirth: '',
  role: 'CUSTOMER',
  notes: '',
};

const STATUS_FILTERS = [
  { key: 'all', label: 'All Accounts' },
  { key: 'PENDING_APPROVAL', label: 'Pending Approval' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'SUSPENDED', label: 'Paused' },
  { key: 'REJECTED', label: 'Rejected' },
];

const getStatusMeta = (status = 'APPROVED') => {
  switch (status) {
    case 'PENDING_APPROVAL':
      return {
        label: 'Pending Approval',
        className: 'bg-warning-subtle text-warning-emphasis',
      };
    case 'SUSPENDED':
      return {
        label: 'Paused',
        className: 'bg-secondary-subtle text-secondary-emphasis',
      };
    case 'REJECTED':
      return {
        label: 'Rejected',
        className: 'bg-danger-subtle text-danger-emphasis',
      };
    default:
      return {
        label: 'Approved',
        className: 'bg-success-subtle text-success-emphasis',
      };
  }
};

const ManageUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);

    try {
      const response = await authFetch('/admin/users');
      const data = await response.json().catch(() => []);

      if (!response.ok) {
        throw new Error(data.message || 'Could not load users.');
      }

      setUsers(Array.isArray(data) ? data : []);
      setError('');
    } catch (fetchError) {
      setError(fetchError.message || 'Could not load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleCreateAccount = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const response = await authFetch('/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Could not create the company account.');
      }

      setMessage(
        `${formData.role === 'ADMIN' ? 'Staff' : 'Customer'} account created successfully.`,
      );
      setFormData(EMPTY_FORM);
      fetchUsers();
    } catch (creationError) {
      setError(creationError.message || 'Could not create the company account.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (id, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';

    if (!window.confirm(`Change this account to ${newRole}?`)) {
      return;
    }

    try {
      const response = await authFetch(`/admin/users/${id}/role?role=${newRole}`, {
        method: 'PUT',
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update the user role.');
      }

      setMessage(`User role updated to ${newRole}.`);
      setError('');
      fetchUsers();
    } catch (roleError) {
      setError(roleError.message || 'Failed to update the user role.');
    }
  };

  const handleAccessReview = async (listedUser, nextStatus) => {
    if (
      !window.confirm(`Do you want to update ${listedUser.name} to ${getStatusMeta(nextStatus).label}?`)
    ) {
      return;
    }

    try {
      const response = await authFetch(`/admin/users/${listedUser.id}/access`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Failed to review the access request.');
      }

      setMessage(data.message || 'Access updated successfully.');
      setError('');
      fetchUsers();
    } catch (reviewError) {
      setError(reviewError.message || 'Failed to review the access request.');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name} from the rental system?`)) {
      return;
    }

    try {
      const response = await authFetch(`/admin/users/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete the user.');
      }

      setMessage(data.message || 'User deleted successfully.');
      setError('');
      fetchUsers();
    } catch (deleteError) {
      setError(deleteError.message || 'Failed to delete the user.');
    }
  };

  const filteredUsers = useMemo(
    () =>
      users.filter((listedUser) => {
        const searchSource = `${listedUser.name} ${listedUser.email} ${listedUser.phone || ''} ${
          listedUser.licenseNumber || ''
        }`.toLowerCase();
        const matchesSearch = searchSource.includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === 'all' ? true : listedUser.accessStatus === statusFilter;

        return matchesSearch && matchesStatus;
      }),
    [searchTerm, statusFilter, users],
  );

  const summary = useMemo(() => {
    const approvedCustomers = users.filter(
      (listedUser) =>
        listedUser.role === 'CUSTOMER' && listedUser.accessStatus === 'APPROVED',
    ).length;
    const pendingApprovals = users.filter(
      (listedUser) => listedUser.accessStatus === 'PENDING_APPROVAL',
    ).length;
    const staffAccounts = users.filter((listedUser) => listedUser.role === 'ADMIN').length;

    return {
      approvedCustomers,
      pendingApprovals,
      staffAccounts,
    };
  }, [users]);

  return (
    <div className="bg-light min-vh-100 pb-5">
      <Navbar />

      <div className="container" style={{ marginTop: '108px' }}>
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-end gap-3 mb-4">
          <div>
            <h2 className="fw-bold m-0">User Access Management</h2>
            <p className="text-muted mb-0">
              Review customer access requests and manage internal customer and staff records from
              the manager dashboard.
            </p>
          </div>

          <div className="input-group" style={{ width: 'min(100%, 360px)' }}>
            <span className="input-group-text bg-white border-end-0">
              <FiSearch />
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search name, email, phone, or license..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4">
                <div className="small text-uppercase text-muted fw-bold mb-2">Pending Queue</div>
                <div className="fw-bold fs-2 text-warning-emphasis">{summary.pendingApprovals}</div>
                <div className="text-muted small">Waiting for manager approval.</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4">
                <div className="small text-uppercase text-muted fw-bold mb-2">Approved Customers</div>
                <div className="fw-bold fs-2 text-success-emphasis">{summary.approvedCustomers}</div>
                <div className="text-muted small">Customers who can log in and request rentals.</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4">
                <div className="small text-uppercase text-muted fw-bold mb-2">Staff Accounts</div>
                <div className="fw-bold fs-2 text-dark">{summary.staffAccounts}</div>
                <div className="text-muted small">Managers, fleet managers, and employees.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4">
                <div className="d-flex align-items-center gap-2 fw-bold mb-3">
                  <FiPlusCircle className="text-danger" /> Create Account
                </div>

                {message ? <div className="alert alert-success rounded-4">{message}</div> : null}
                {error ? <div className="alert alert-danger rounded-4">{error}</div> : null}

                <form onSubmit={handleCreateAccount}>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-semibold">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="form-control rounded-4"
                        placeholder="Customer or employee name"
                        required
                      />
                    </div>

                    <div className="col-md-7">
                      <label className="form-label fw-semibold">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="form-control rounded-4"
                        placeholder="name@company.com"
                        required
                      />
                    </div>

                    <div className="col-md-5">
                      <label className="form-label fw-semibold">Role</label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="form-select rounded-4"
                      >
                        <option value="CUSTOMER">Customer</option>
                        <option value="ADMIN">Admin / Employee</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Password</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="form-control rounded-4"
                        placeholder="Minimum 8 characters"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Phone</label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="form-control rounded-4"
                        placeholder="+94 77 123 4567"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">License / NIC</label>
                      <input
                        type="text"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        className="form-control rounded-4"
                        placeholder="License or NIC"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Date of Birth</label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className="form-control rounded-4"
                      />
                    </div>

                    <div className="col-md-8">
                      <label className="form-label fw-semibold">Address</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="form-control rounded-4"
                        placeholder="Street, town, or branch"
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Postal Code</label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        className="form-control rounded-4"
                        placeholder="Postal"
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Notes</label>
                      <input
                        type="text"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        className="form-control rounded-4"
                        placeholder="Fleet manager, branch employee, wedding customer..."
                      />
                    </div>
                  </div>

                  <div className="rounded-4 border bg-light p-3 mt-4">
                    <div className="fw-semibold mb-1">Created by {user?.name || 'Admin'}</div>
                    <div className="small text-muted">
                      Accounts created from this screen are approved immediately. Customer requests
                      submitted from the login page arrive separately in the pending approval list.
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-danger rounded-pill fw-bold px-4 py-3 mt-4 w-100"
                  >
                    {submitting ? 'Creating account...' : 'Create Account'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4 d-flex flex-column gap-3">
                <div className="d-flex align-items-center gap-2 fw-bold">
                  <FiShield className="text-danger" /> JWT Security Notes
                </div>

                <div className="rounded-4 border bg-light p-3">
                  <div className="fw-semibold mb-2">Backend-controlled roles</div>
                  <div className="small text-muted">
                    The server decides whether a user is an admin or a customer. Frontend changes
                    alone cannot elevate a user to staff access.
                  </div>
                </div>

                <div className="rounded-4 border p-3">
                  <div className="fw-semibold mb-2">Approval handling</div>
                  <div className="small text-muted">
                    Customer access requests submitted from the login page appear here as
                    `PENDING_APPROVAL`. Managers can approve, reject, pause, reactivate, or remove
                    accounts from this panel.
                  </div>
                </div>

                <div className="rounded-4 border p-3">
                  <div className="fw-semibold mb-2">Role summary</div>
                  <div className="small text-muted">
                    Use `ADMIN` for managers, fleet managers, and employees with system access.
                    Use `CUSTOMER` for rental clients.
                  </div>
                </div>

                <div className="rounded-4 border p-3">
                  <div className="fw-semibold mb-2">Quick filters</div>
                  <div className="d-flex flex-wrap gap-2">
                    {STATUS_FILTERS.map((filter) => (
                      <button
                        key={filter.key}
                        type="button"
                        onClick={() => setStatusFilter(filter.key)}
                        className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                          statusFilter === filter.key ? 'btn-dark' : 'btn-light border'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle m-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3 border-0">User Details</th>
                  <th className="py-3 border-0">Contact</th>
                  <th className="py-3 border-0">Role</th>
                  <th className="py-3 border-0">Access Status</th>
                  <th className="py-3 border-0">Source</th>
                  <th className="px-4 py-3 border-0 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div className="spinner-border text-danger"></div>
                    </td>
                  </tr>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((listedUser) => {
                    const statusMeta = getStatusMeta(listedUser.accessStatus);

                    return (
                      <tr key={listedUser.id}>
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center gap-3">
                            {listedUser.image ? (
                              <img
                                src={listedUser.image}
                                alt="avatar"
                                className="rounded-circle object-fit-cover"
                                style={{ width: '40px', height: '40px' }}
                              />
                            ) : (
                              <div
                                className="bg-secondary bg-opacity-10 text-secondary rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: '40px', height: '40px' }}
                              >
                                <FiUser />
                              </div>
                            )}
                            <div>
                              <div className="fw-bold text-dark">{listedUser.name}</div>
                              <div className="small text-muted">{listedUser.email}</div>
                              <div className="small text-muted">{listedUser.address || 'No address'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="small text-muted">{listedUser.phone || 'No phone'}</div>
                          <div className="small text-muted">
                            {listedUser.licenseNumber || 'No license / NIC'}
                          </div>
                        </td>
                        <td className="py-3">
                          <span
                            className={`badge rounded-pill px-3 py-2 ${
                              listedUser.role === 'ADMIN' ? 'bg-dark' : 'bg-primary'
                            }`}
                          >
                            {listedUser.role}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`badge rounded-pill px-3 py-2 ${statusMeta.className}`}>
                            {statusMeta.label}
                          </span>
                        </td>
                        <td className="py-3 text-muted small">
                          <div>{listedUser.accountSource || 'BACKEND'}</div>
                          <div>{listedUser.reviewedBy || listedUser.createdBy || 'Not reviewed yet'}</div>
                        </td>
                        <td className="px-4 py-3 text-end">
                          <div className="d-flex flex-wrap justify-content-end gap-2">
                            {listedUser.accessStatus === 'PENDING_APPROVAL' ? (
                              <>
                                <button
                                  onClick={() => handleAccessReview(listedUser, 'APPROVED')}
                                  className="btn btn-sm btn-success rounded-pill px-3"
                                >
                                  <FiCheckCircle className="me-1" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleAccessReview(listedUser, 'REJECTED')}
                                  className="btn btn-sm btn-outline-danger rounded-pill px-3"
                                >
                                  <FiXCircle className="me-1" />
                                  Reject
                                </button>
                              </>
                            ) : listedUser.accessStatus === 'APPROVED' ? (
                              <button
                                onClick={() => handleAccessReview(listedUser, 'SUSPENDED')}
                                className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                              >
                                <FiPauseCircle className="me-1" />
                                Pause
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAccessReview(listedUser, 'APPROVED')}
                                className="btn btn-sm btn-outline-success rounded-pill px-3"
                              >
                                <FiCheckCircle className="me-1" />
                                Reactivate
                              </button>
                            )}

                            <button
                              onClick={() => handleRoleChange(listedUser.id, listedUser.role)}
                              className="btn btn-sm btn-outline-dark rounded-pill px-3"
                            >
                              <FiUsers className="me-1" />
                              {listedUser.role === 'ADMIN' ? 'Make Customer' : 'Make Admin'}
                            </button>
                            <button
                              onClick={() => handleDelete(listedUser.id, listedUser.name)}
                              className="btn btn-sm btn-danger rounded-pill px-3"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      No users found for the current search and status filter. New customer access
                      requests will appear here after they are submitted from the login page.
                    </td>
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

export default ManageUsers;
