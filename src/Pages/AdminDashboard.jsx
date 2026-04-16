import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  FiActivity,
  FiClock,
  FiMonitor,
  FiSearch,
  FiUserCheck,
  FiUsers,
} from 'react-icons/fi';
import { authFetch } from '../utils/api';

const AdminDashboard = () => {
  const [loginLogs, setLoginLogs] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLogins: 0,
    activeRentals: 0,
    pendingApprovals: 0,
    approvedCustomers: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError('');

      try {
        const [statsResponse, logsResponse] = await Promise.all([
          authFetch('/admin/stats'),
          authFetch('/admin/login-history'),
        ]);

        const [statsData, logsData] = await Promise.all([
          statsResponse.json().catch(() => ({})),
          logsResponse.json().catch(() => []),
        ]);

        if (!statsResponse.ok || !logsResponse.ok) {
          throw new Error(statsData.message || logsData.message || 'Could not load dashboard.');
        }

        setStats((current) => ({
          ...current,
          ...statsData,
        }));
        setLoginLogs(Array.isArray(logsData) ? logsData : []);
        setError('');
      } catch (loadError) {
        setError(loadError.message || 'Could not load dashboard.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const filteredLogs = useMemo(
    () =>
      loginLogs.filter(
        (log) =>
          log.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.ip?.includes(searchTerm) ||
          log.device?.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [loginLogs, searchTerm],
  );

  return (
    <div className="bg-light min-vh-100">
      <Navbar />

      <div className="container" style={{ marginTop: '108px', paddingBottom: '50px' }}>
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-end gap-3 mb-4">
          <div>
            <p className="text-uppercase small fw-bold text-danger mb-2">Admin Control Center</p>
            <h2 className="fw-bold mb-2">Backend-secured operations dashboard</h2>
            <p className="text-muted mb-0">
              Review live login events, pending approvals, and the overall user base through the
              JWT-protected API.
            </p>
          </div>

          <Link to="/admin/manage-users" className="btn btn-dark rounded-pill fw-bold px-4 py-3">
            Review User Access
          </Link>
        </div>

        {error ? <div className="alert alert-danger rounded-4 mb-4">{error}</div> : null}

        <div className="row g-4 mb-5">
          <div className="col-md-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary">
                  <FiUsers size={24} />
                </div>
                <div>
                  <div className="fw-bold fs-3">{stats.totalUsers}</div>
                  <div className="text-muted small">Total users</div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-warning bg-opacity-10 p-3 rounded-circle text-warning">
                  <FiUserCheck size={24} />
                </div>
                <div>
                  <div className="fw-bold fs-3">{stats.pendingApprovals || 0}</div>
                  <div className="text-muted small">Pending approvals</div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-danger bg-opacity-10 p-3 rounded-circle text-danger">
                  <FiActivity size={24} />
                </div>
                <div>
                  <div className="fw-bold fs-3">{stats.activeRentals}</div>
                  <div className="text-muted small">Active rentals</div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-success bg-opacity-10 p-3 rounded-circle text-success">
                  <FiMonitor size={24} />
                </div>
                <div>
                  <div className="fw-bold fs-3">{stats.totalLogins}</div>
                  <div className="text-muted small">Login events</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-4 d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
            <div>
              <div className="fw-semibold mb-1">Secure role enforcement is active</div>
              <div className="text-muted small">
                The backend issues JWTs after login and checks every admin route on the server
                before returning dashboard data.
              </div>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <span className="badge rounded-pill bg-warning-subtle text-warning-emphasis px-3 py-2">
                Pending: {stats.pendingApprovals || 0}
              </span>
              <span className="badge rounded-pill bg-success-subtle text-success-emphasis px-3 py-2">
                Approved customers: {stats.approvedCustomers || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-header bg-white border-bottom p-4 d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 rounded-top-4">
            <div>
              <h5 className="fw-bold m-0 d-flex align-items-center gap-2">
                <FiClock /> Login History And Audit Logs
              </h5>
              <div className="small text-muted mt-1">
                Recent admin and customer sign-ins recorded by the backend.
              </div>
            </div>
            <div className="input-group" style={{ width: 'min(100%, 320px)' }}>
              <span className="input-group-text bg-light border-end-0">
                <FiSearch />
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Search name, IP, or device..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>

          <div className="card-body p-0 overflow-auto">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-muted small">
                <tr>
                  <th className="px-4 py-3 border-0">User Name</th>
                  <th className="py-3 border-0">Date And Time</th>
                  <th className="py-3 border-0">IP Address</th>
                  <th className="py-3 border-0">Device Details</th>
                  <th className="px-4 py-3 border-0 text-end">Access Type</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5">
                      <div className="spinner-border text-danger"></div>
                    </td>
                  </tr>
                ) : filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-4 py-3 fw-semibold">{log.name}</td>
                      <td className="py-3 text-muted">
                        {log.time ? new Date(log.time).toLocaleString() : '--'}
                      </td>
                      <td className="py-3 font-monospace small">{log.ip || 'Local session'}</td>
                      <td className="py-3 text-muted small">{log.device || 'Browser session'}</td>
                      <td className="px-4 py-3 text-end">
                        <span
                          className={`badge rounded-pill px-3 py-2 ${
                            log.type?.includes('ADMIN') ? 'bg-dark text-white' : 'bg-danger text-white'
                          }`}
                        >
                          {log.type}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">
                      No matching audit logs found.
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

export default AdminDashboard;
