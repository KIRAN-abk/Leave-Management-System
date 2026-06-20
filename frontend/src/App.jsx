import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Leaves from './pages/Leaves';
import Employees from './pages/Employees';
import Departments from './pages/Departments';
import Policies from './pages/Policies';
import Reports from './pages/Reports';
import ChangePassword from './pages/ChangePassword';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes - All Authenticated Roles */}
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Manager', 'Employee']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaves"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Manager', 'Employee']}>
                <Leaves />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Manager', 'Employee']}>
                <ChangePassword />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Managers and Admins */}
          <Route
            path="/employees"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
                <Employees />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Admin Only */}
          <Route
            path="/departments"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <Departments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/policies"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <Policies />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <Reports />
              </ProtectedRoute>
            }
          />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
