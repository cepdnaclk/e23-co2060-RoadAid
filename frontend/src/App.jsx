import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import CustomerDashboard from "./pages/CustomerDashboard";
import MechanicDashboard from "./pages/MechanicDashboard";
import { getAuth } from "./auth";

function RequireRole({ role, children }) {
  const auth = getAuth();
  if (!auth.token) return <Navigate to="/login" replace />;
  if (auth.role && auth.role !== role) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/customer"
          element={
            <RequireRole role="customer">
              <CustomerDashboard />
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

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}