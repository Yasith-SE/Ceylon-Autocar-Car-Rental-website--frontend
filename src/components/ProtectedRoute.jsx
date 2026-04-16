import { Navigate } from 'react-router-dom';
import useAuth from '../context/useAuth';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user } = useAuth();

    // 1. If no user is logged in, send them to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (
        user.accessStatus &&
        user.accessStatus !== 'APPROVED'
    ) {
        return <Navigate to="/login" replace />;
    }

    // 2. If the user is logged in but doesn't have the right role, send to home
    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    // 3. If they pass both checks, render the page
    return children;
};

export default ProtectedRoute;
