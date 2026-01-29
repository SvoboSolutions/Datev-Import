import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { AppLayout } from "./layout/AppLayout";

import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ImportsPage } from "./pages/ImportsPage";
import { EmployeesPage } from "./pages/EmployeesPage";

function ProtectedRoutes() {
  const { authenticated } = useAuth();

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/imports" element={<ImportsPage />} />
        <Route path="/employees" element={<EmployeesPage />} />
      </Routes>
    </AppLayout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<ProtectedRoutes />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
