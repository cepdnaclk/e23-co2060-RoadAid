import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import CustomerSignup from "./pages/CustomerSignup";
import MechanicSignup from "./pages/MechanicSignup";
import ForgotPassword from "./pages/ForgotPassword";
import CustomerDashboard from "./pages/CustomerDashboard";
import MechanicDashboard from "./pages/MechanicDashboard";
import MechanicSettings from "./pages/MechanicSettings";
import CustomerHistory from "./pages/CustomerHistory";
import MechanicHistory from "./pages/MechanicHistory";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminRequests from "./pages/AdminRequests";
import { getAuth } from "./auth";

function RequireRole({ role, children }) {
  const auth = getAuth();
  if (!auth.token) return <Navigate to="/login" replace />;
  if (auth.role && auth.role !== role) return <Navigate to="/login" replace />;
  return children;
}

function RequireStaff({ children }) {
  const auth = getAuth();
  if (!auth.token) return <Navigate to="/login" replace />;
  if (!auth.isStaff) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup/customer" element={<CustomerSignup />} />
        <Route path="/signup/mechanic" element={<MechanicSignup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          path="/customer"
          element={
            <RequireRole role="customer">
              <CustomerDashboard />
            </RequireRole>
          }
        />

        <Route
          path="/customer/history"
          element={
            <RequireRole role="customer">
              <CustomerHistory />
            </RequireRole>
          }
        />

        <Route
          path="/mechanic"
          element={
            <RequireRole role="mechanic">
              <MechanicDashboard />
            </RequireRole>
          }
        />

        <Route
          path="/mechanic/history"
          element={
            <RequireRole role="mechanic">
              <MechanicHistory />
            </RequireRole>
          }
        />

        <Route
          path="/mechanic/settings"
          element={
            <RequireRole role="mechanic">
              <MechanicSettings />
            </RequireRole>
          }
        />

        <Route
          path="/admin"
          element={
            <RequireStaff>
              <AdminDashboard />
            </RequireStaff>
          }
        />

        <Route
          path="/admin/users"
          element={
            <RequireStaff>
              <AdminUsers />
            </RequireStaff>
          }
        />

        <Route
          path="/admin/requests"
          element={
            <RequireStaff>
              <AdminRequests />
            </RequireStaff>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}