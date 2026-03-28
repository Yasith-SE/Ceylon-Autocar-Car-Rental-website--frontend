import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Import all your pages
import Home from "./Pages/Home";
import AvailableCars from "./Pages/AvailableCars";
import Login from "./Pages/Login";
import SignUp from "./Pages/SignUp";
import UploadCar from "./Pages/UploadCar"; 
import AdminDashboard from "./Pages/AdminDashboard";
import Profile from "./Pages/Profile";
import Category from "./Pages/Category";       // NEW IMPORT
import Dealership from "./Pages/Dealership";   // NEW IMPORT
import FloatingChat from "./components/FloatingChat";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/available" element={<AvailableCars />} />
          <Route path="/category" element={<Category />} />         {/* NEW ROUTE */}
          <Route path="/dealership" element={<Dealership />} />     {/* NEW ROUTE */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

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
          
        </Routes>
        <FloatingChat />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;