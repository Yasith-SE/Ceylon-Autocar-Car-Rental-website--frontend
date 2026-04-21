import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Import all your pages
import Home from "./Pages/Home";
import AvailableCars from "./Pages/AvailableCars";
import Login from "./Pages/Login";
import Service from "./Pages/Service";
import UploadCar from "./Pages/UploadCar";
import AdminDashboard from "./Pages/AdminDashboard";
import Profile from "./Pages/Profile";
import Category from "./Pages/Category";       
import Dealership from "./Pages/Dealership";   
import ManageUsers from "./Pages/ManageUsers";
import CarShowroom from "./Pages/CarShowroom"; // NEW IMPORT
import AdminSupportChat from "./Pages/AdminSupportChat";

import FloatingChat from "./components/FloatingChat";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/available" element={<AvailableCars />} />
          <Route path="/category" element={<Category />} />         
          <Route path="/dealership" element={<Dealership />} />     
          <Route path="/login" element={<Login />} />
          <Route path="/service" element={<Service />} />
          <Route path="/signup" element={<Navigate to="/login" replace />} />
          <Route path="/showroom" element={<CarShowroom />} /> {/* NEW ROUTE */}

          {/* Protected Routes - ADMIN & CUSTOMER */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'CUSTOMER']}>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - ADMIN ONLY */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/upload-car"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <UploadCar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/manage-users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <ManageUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/support-chat"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminSupportChat />
              </ProtectedRoute>
            }
          />

        </Routes>
        <FloatingChat />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
