const COMPANY_USERS_STORAGE_KEY = 'ceylon-autocar-company-users';
const COMPANY_RENTALS_STORAGE_KEY = 'ceylon-autocar-rental-requests';
const COMPANY_LOGIN_LOGS_STORAGE_KEY = 'ceylon-autocar-login-logs';

const COMPANY_CREATED_ACCOUNT_SOURCE = 'STAFF_ISSUED';
const COMPANY_SELF_REGISTERED_ACCOUNT_SOURCE = 'SELF_REGISTERED';

export const COMPANY_ACCESS_STATUSES = {
  APPROVED: 'APPROVED',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED',
};

const ACCESS_STATUS_SET = new Set(Object.values(COMPANY_ACCESS_STATUSES));

const nowIso = () => new Date().toISOString();

const createId = (prefix) => {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const normalizeEmail = (email = '') => String(email).trim().toLowerCase();

const normalizeAccessStatus = (status, role = 'CUSTOMER') => {
  if (ACCESS_STATUS_SET.has(status)) {
    return status;
  }

  return role === 'ADMIN'
    ? COMPANY_ACCESS_STATUSES.APPROVED
    : COMPANY_ACCESS_STATUSES.APPROVED;
};

const normalizeRole = (role = 'CUSTOMER') =>
  String(role).toUpperCase() === 'ADMIN' ? 'ADMIN' : 'CUSTOMER';

const normalizeCompanyUserRecord = (user = {}) => {
  const role = normalizeRole(user.role);
  const accessStatus = normalizeAccessStatus(user.accessStatus, role);
  const approvedBy =
    accessStatus === COMPANY_ACCESS_STATUSES.APPROVED
      ? user.approvedBy || user.issuedBy || 'Ceylon AutoCar Admin'
      : user.approvedBy || '';
  const approvedAt =
    accessStatus === COMPANY_ACCESS_STATUSES.APPROVED
      ? user.approvedAt || user.reviewedAt || user.createdAt || nowIso()
      : user.approvedAt || '';

  return {
    ...user,
    role,
    email: normalizeEmail(user.email),
    accessStatus,
    accountSource:
      user.accountSource ||
      (role === 'ADMIN' ? 'COMPANY_STAFF' : COMPANY_CREATED_ACCOUNT_SOURCE),
    name: String(user.name || '').trim(),
    title: String(user.title || '').trim(),
    address: String(user.address || '').trim(),
    postalCode: String(user.postalCode || '').trim(),
    phone: String(user.phone || '').trim(),
    licenseNumber: String(user.licenseNumber || '').trim(),
    notes: String(user.notes || '').trim(),
    issuedBy: String(user.issuedBy || '').trim(),
    approvedBy: String(approvedBy || '').trim(),
    approvedAt,
    reviewedBy: String(user.reviewedBy || '').trim(),
    reviewedAt: user.reviewedAt || '',
    createdAt: user.createdAt || nowIso(),
  };
};

const DEFAULT_COMPANY_USERS = [
  normalizeCompanyUserRecord({
    id: 'admin-hq-001',
    name: 'Ceylon AutoCar Admin',
    email: 'admin@ceylonautocar.lk',
    password: 'Admin@123',
    role: 'ADMIN',
    title: 'Showroom Manager',
    address: 'Ceylon AutoCar Head Office, Colombo',
    postalCode: '00300',
    dateOfBirth: '1990-01-01',
    accountSource: 'COMPANY_STAFF',
    accessStatus: COMPANY_ACCESS_STATUSES.APPROVED,
    approvedBy: 'System Seed',
    approvedAt: '2026-01-01T08:00:00.000Z',
    createdAt: '2026-01-01T08:00:00.000Z',
  }),
  normalizeCompanyUserRecord({
    id: 'customer-issued-001',
    name: 'Nadeesha Perera',
    email: 'customer@ceylonautocar.lk',
    password: 'Customer@123',
    role: 'CUSTOMER',
    title: 'Issued Customer Account',
    address: 'Ward Place, Colombo',
    postalCode: '00700',
    dateOfBirth: '1998-06-15',
    phone: '+94 77 123 4567',
    licenseNumber: 'B7845126',
    accountSource: COMPANY_CREATED_ACCOUNT_SOURCE,
    accessStatus: COMPANY_ACCESS_STATUSES.APPROVED,
    approvedBy: 'Ceylon AutoCar Admin',
    approvedAt: '2026-01-10T10:30:00.000Z',
    createdAt: '2026-01-10T10:30:00.000Z',
    issuedBy: 'Ceylon AutoCar Admin',
  }),
];

const DEFAULT_RENTAL_REQUESTS = [];
const DEFAULT_LOGIN_LOGS = [];

const readJsonStorage = (key, fallbackValue) => {
  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallbackValue;
  } catch {
    return fallbackValue;
  }
};

const writeJsonStorage = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures and continue with in-memory values.
  }
};

const ensureCompanyData = () => {
  if (typeof window === 'undefined') {
    return;
  }

  if (!window.localStorage.getItem(COMPANY_USERS_STORAGE_KEY)) {
    writeJsonStorage(COMPANY_USERS_STORAGE_KEY, DEFAULT_COMPANY_USERS);
  }

  if (!window.localStorage.getItem(COMPANY_RENTALS_STORAGE_KEY)) {
    writeJsonStorage(COMPANY_RENTALS_STORAGE_KEY, DEFAULT_RENTAL_REQUESTS);
  }

  if (!window.localStorage.getItem(COMPANY_LOGIN_LOGS_STORAGE_KEY)) {
    writeJsonStorage(COMPANY_LOGIN_LOGS_STORAGE_KEY, DEFAULT_LOGIN_LOGS);
  }
};

const getCompanyUsersRaw = () => {
  ensureCompanyData();
  return readJsonStorage(COMPANY_USERS_STORAGE_KEY, DEFAULT_COMPANY_USERS).map(
    normalizeCompanyUserRecord,
  );
};

const saveCompanyUsersRaw = (users) => {
  writeJsonStorage(
    COMPANY_USERS_STORAGE_KEY,
    users.map((user) => normalizeCompanyUserRecord(user)),
  );
};

const getRentalRequestsRaw = () => {
  ensureCompanyData();
  return readJsonStorage(COMPANY_RENTALS_STORAGE_KEY, DEFAULT_RENTAL_REQUESTS);
};

const saveRentalRequestsRaw = (rentals) => {
  writeJsonStorage(COMPANY_RENTALS_STORAGE_KEY, rentals);
};

const getLoginLogsRaw = () => {
  ensureCompanyData();
  return readJsonStorage(COMPANY_LOGIN_LOGS_STORAGE_KEY, DEFAULT_LOGIN_LOGS);
};

const saveLoginLogsRaw = (logs) => {
  writeJsonStorage(COMPANY_LOGIN_LOGS_STORAGE_KEY, logs);
};

const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }

  const { password: _PASSWORD, ...safeUser } = normalizeCompanyUserRecord(user);
  return safeUser;
};

const sortByNewest = (items) =>
  [...items].sort(
    (leftItem, rightItem) =>
      new Date(rightItem.createdAt || rightItem.time || 0).getTime() -
      new Date(leftItem.createdAt || leftItem.time || 0).getTime(),
  );

export const seedCompanyAccessData = () => {
  ensureCompanyData();
};

export const getCompanyCredentialHints = () => ({
  admin: {
    email: DEFAULT_COMPANY_USERS[0].email,
    password: 'Admin@123',
  },
  customer: {
    email: DEFAULT_COMPANY_USERS[1].email,
    password: 'Customer@123',
  },
});

export const listCompanyUsers = () =>
  sortByNewest(getCompanyUsersRaw()).map((user) => sanitizeUser(user));

export const listPendingCompanyUsers = () =>
  listCompanyUsers().filter(
    (user) => user.accessStatus === COMPANY_ACCESS_STATUSES.PENDING_APPROVAL,
  );

export const getCompanyUserById = (userId) =>
  sanitizeUser(getCompanyUsersRaw().find((user) => user.id === userId));

export const updateCompanyUser = (userId, partialUser) => {
  const users = getCompanyUsersRaw();
  const userIndex = users.findIndex((user) => user.id === userId);

  if (userIndex === -1) {
    throw new Error('The selected account could not be found.');
  }

  users[userIndex] = normalizeCompanyUserRecord({
    ...users[userIndex],
    ...partialUser,
  });

  saveCompanyUsersRaw(users);
  return sanitizeUser(users[userIndex]);
};

export const loginWithCompanyAccount = ({ email, password, role }) => {
  const normalizedEmail = normalizeEmail(email);
  const normalizedRole = role ? normalizeRole(role) : '';
  const users = getCompanyUsersRaw();
  const matchedUser = users.find(
    (user) =>
      normalizeEmail(user.email) === normalizedEmail &&
      user.password === password,
  );

  if (!matchedUser) {
    return {
      ok: false,
      reason: 'INVALID_CREDENTIALS',
      message: 'Invalid credentials. Check the email and password and try again.',
    };
  }

  if (normalizedRole && matchedUser.role !== normalizedRole) {
    return {
      ok: false,
      reason: 'ROLE_MISMATCH',
      message: `This account is registered as ${matchedUser.role}. Switch the access type and try again.`,
    };
  }

  if (matchedUser.accessStatus !== COMPANY_ACCESS_STATUSES.APPROVED) {
    const messageMap = {
      [COMPANY_ACCESS_STATUSES.PENDING_APPROVAL]:
        'Your registration is pending admin approval. Please wait until showroom staff activates your account.',
      [COMPANY_ACCESS_STATUSES.REJECTED]:
        'This registration request was not approved. Contact the showroom team for help.',
      [COMPANY_ACCESS_STATUSES.SUSPENDED]:
        'This account is temporarily paused. Please contact Ceylon AutoCar support.',
    };

    return {
      ok: false,
      reason: matchedUser.accessStatus,
      message:
        messageMap[matchedUser.accessStatus] ||
        'This account cannot sign in right now.',
    };
  }

  const loginLogs = getLoginLogsRaw();
  loginLogs.unshift({
    id: createId('login'),
    userId: matchedUser.id,
    name: matchedUser.name,
    type: matchedUser.role === 'ADMIN' ? 'ADMIN_LOGIN' : 'CUSTOMER_LOGIN',
    time: nowIso(),
    ip: 'Showroom Local Session',
    device: window.navigator.userAgent || 'Browser session',
  });
  saveLoginLogsRaw(loginLogs.slice(0, 80));

  return {
    ok: true,
    user: sanitizeUser(matchedUser),
  };
};

export const createCompanyUser = ({
  name,
  email,
  password,
  address,
  postalCode,
  dateOfBirth,
  phone,
  licenseNumber,
  notes,
  role = 'CUSTOMER',
  title,
  issuedBy,
  accessStatus,
  approvedBy,
}) => {
  const users = getCompanyUsersRaw();
  const normalizedEmail = normalizeEmail(email);
  const normalizedRole = normalizeRole(role);

  if (users.some((user) => normalizeEmail(user.email) === normalizedEmail)) {
    throw new Error('A company account with this email already exists.');
  }

  const nextStatus =
    accessStatus ||
    (normalizedRole === 'ADMIN'
      ? COMPANY_ACCESS_STATUSES.APPROVED
      : COMPANY_ACCESS_STATUSES.APPROVED);

  const nextUser = normalizeCompanyUserRecord({
    id: createId(normalizedRole === 'ADMIN' ? 'admin' : 'customer'),
    name: String(name || '').trim(),
    email: normalizedEmail,
    password,
    role: normalizedRole,
    title:
      normalizedRole === 'ADMIN'
        ? title || 'Rental Staff Account'
        : title || 'Showroom Customer Account',
    address: String(address || '').trim(),
    postalCode: String(postalCode || '').trim(),
    dateOfBirth: dateOfBirth || '',
    phone: String(phone || '').trim(),
    licenseNumber: String(licenseNumber || '').trim(),
    notes: String(notes || '').trim(),
    accessStatus: nextStatus,
    accountSource:
      normalizedRole === 'ADMIN' ? 'COMPANY_STAFF' : COMPANY_CREATED_ACCOUNT_SOURCE,
    issuedBy: issuedBy || '',
    approvedBy:
      nextStatus === COMPANY_ACCESS_STATUSES.APPROVED
        ? approvedBy || issuedBy || 'Ceylon AutoCar Admin'
        : '',
    approvedAt:
      nextStatus === COMPANY_ACCESS_STATUSES.APPROVED ? nowIso() : '',
    reviewedBy:
      nextStatus === COMPANY_ACCESS_STATUSES.APPROVED
        ? approvedBy || issuedBy || 'Ceylon AutoCar Admin'
        : '',
    reviewedAt: nextStatus === COMPANY_ACCESS_STATUSES.APPROVED ? nowIso() : '',
    createdAt: nowIso(),
  });

  users.unshift(nextUser);
  saveCompanyUsersRaw(users);
  return sanitizeUser(nextUser);
};

export const registerCompanyCustomer = ({
  name,
  email,
  password,
  address,
  postalCode,
  dateOfBirth,
  phone,
  licenseNumber,
  notes,
}) =>
  createCompanyUser({
    name,
    email,
    password,
    address,
    postalCode,
    dateOfBirth,
    phone,
    licenseNumber,
    notes,
    role: 'CUSTOMER',
    title: 'Pending Customer Registration',
    issuedBy: 'Public Registration Form',
    accessStatus: COMPANY_ACCESS_STATUSES.PENDING_APPROVAL,
    approvedBy: '',
  });

export const reviewCompanyUserAccess = (userId, nextStatus, reviewedBy) => {
  const users = getCompanyUsersRaw();
  const userIndex = users.findIndex((user) => user.id === userId);
  const normalizedStatus = normalizeAccessStatus(nextStatus);

  if (userIndex === -1) {
    throw new Error('The selected account could not be found.');
  }

  users[userIndex] = normalizeCompanyUserRecord({
    ...users[userIndex],
    accessStatus: normalizedStatus,
    reviewedBy: reviewedBy || 'Ceylon AutoCar Admin',
    reviewedAt: nowIso(),
    approvedBy:
      normalizedStatus === COMPANY_ACCESS_STATUSES.APPROVED
        ? reviewedBy || 'Ceylon AutoCar Admin'
        : users[userIndex].approvedBy,
    approvedAt:
      normalizedStatus === COMPANY_ACCESS_STATUSES.APPROVED
        ? users[userIndex].approvedAt || nowIso()
        : users[userIndex].approvedAt,
  });

  saveCompanyUsersRaw(users);
  return sanitizeUser(users[userIndex]);
};

export const updateCompanyUserRole = (userId, nextRole) => {
  const users = getCompanyUsersRaw();
  const admins = users.filter((user) => user.role === 'ADMIN');
  const userIndex = users.findIndex((user) => user.id === userId);
  const normalizedNextRole = normalizeRole(nextRole);

  if (userIndex === -1) {
    throw new Error('The selected account could not be found.');
  }

  if (
    users[userIndex].role === 'ADMIN' &&
    normalizedNextRole !== 'ADMIN' &&
    admins.length === 1
  ) {
    throw new Error('At least one admin account must remain in the system.');
  }

  users[userIndex] = normalizeCompanyUserRecord({
    ...users[userIndex],
    role: normalizedNextRole,
    accessStatus:
      normalizedNextRole === 'ADMIN'
        ? COMPANY_ACCESS_STATUSES.APPROVED
        : users[userIndex].accessStatus,
    accountSource:
      normalizedNextRole === 'ADMIN'
        ? 'COMPANY_STAFF'
        : users[userIndex].accountSource || COMPANY_CREATED_ACCOUNT_SOURCE,
    approvedBy:
      normalizedNextRole === 'ADMIN'
        ? users[userIndex].approvedBy || 'Ceylon AutoCar Admin'
        : users[userIndex].approvedBy,
    approvedAt:
      normalizedNextRole === 'ADMIN'
        ? users[userIndex].approvedAt || nowIso()
        : users[userIndex].approvedAt,
  });

  saveCompanyUsersRaw(users);
  return sanitizeUser(users[userIndex]);
};

export const deleteCompanyUser = (userId) => {
  const users = getCompanyUsersRaw();
  const nextUsers = users.filter((user) => user.id !== userId);
  const removedUser = users.find((user) => user.id === userId);

  if (!removedUser) {
    throw new Error('The selected account could not be found.');
  }

  if (
    removedUser.role === 'ADMIN' &&
    users.filter((user) => user.role === 'ADMIN').length === 1
  ) {
    throw new Error('You cannot delete the final admin account.');
  }

  saveCompanyUsersRaw(nextUsers);
  return sanitizeUser(removedUser);
};

export const listRentalRequests = () => sortByNewest(getRentalRequestsRaw());

export const createRentalRequest = ({
  carId,
  userId,
  carName,
  customerName,
  pickupLocation,
  dropoffLocation,
  startDate,
  endDate,
  source = 'SHOWROOM',
  ...extraFields
}) => {
  const rentalRequests = getRentalRequestsRaw();
  const nextRequest = {
    id: createId('rental'),
    carId,
    userId,
    carName,
    customerName,
    pickupLocation,
    dropoffLocation,
    startDate,
    endDate,
    ...extraFields,
    source,
    status: 'Pending Staff Review',
    handledBy: 'Showroom admin or rental employee',
    createdAt: nowIso(),
  };

  rentalRequests.unshift(nextRequest);
  saveRentalRequestsRaw(rentalRequests);
  return nextRequest;
};

export const getCompanyStats = () => {
  const users = getCompanyUsersRaw();
  const rentals = getRentalRequestsRaw();
  const loginLogs = getLoginLogsRaw();

  return {
    totalUsers: users.length,
    totalLogins: loginLogs.length,
    activeRentals: rentals.filter((rental) =>
      ['Pending Staff Review', 'Approved', 'Active'].includes(rental.status),
    ).length,
    pendingApprovals: users.filter(
      (user) => user.accessStatus === COMPANY_ACCESS_STATUSES.PENDING_APPROVAL,
    ).length,
    approvedCustomers: users.filter(
      (user) =>
        user.role === 'CUSTOMER' &&
        user.accessStatus === COMPANY_ACCESS_STATUSES.APPROVED,
    ).length,
  };
};

export const getCompanyLoginHistory = () => sortByNewest(getLoginLogsRaw());
