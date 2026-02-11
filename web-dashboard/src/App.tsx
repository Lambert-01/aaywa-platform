import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';

import VSLA from './pages/VSLA';
import WarehouseView from './pages/WarehouseView';
import FarmersPage from './pages/FarmersPage';
import InputsSalesPage from './pages/InputsSalesPage';
import CohortsPage from './pages/CohortsPage';
import CompostPage from './pages/CompostPage';
import TrainingPage from './pages/TrainingPage';
import MapsPage from './pages/MapsPage';
import OrdersPage from './pages/OrdersPage';
import UsersPage from './pages/UsersPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import './App.css';

/**
 * Role-Based Access Control (RBAC) Configuration:
 * - project_manager: Full access to all pages
 * - agronomist: Farmers, Cohorts, Compost, Warehouse, Maps, Inputs/Sales
 * - field_facilitator: Farmers, Training, VSLA
 * - buyer: Orders, Catalog (read-only)
 */

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Protected dashboard routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['project_manager', 'agronomist', 'field_facilitator']}>
              <Layout />
            </ProtectedRoute>
          }>
            {/* Dashboard home - all roles */}
            <Route index element={<Dashboard />} />

            {/* Farmers - project_manager, agronomist, field_facilitator */}
            <Route path="farmers" element={
              <ProtectedRoute allowedRoles={['project_manager', 'agronomist', 'field_facilitator']}>
                <FarmersPage />
              </ProtectedRoute>
            } />

            {/* Cohorts - project_manager, agronomist */}
            <Route path="cohorts" element={
              <ProtectedRoute allowedRoles={['project_manager', 'agronomist']}>
                <CohortsPage />
              </ProtectedRoute>
            } />

            {/* Compost - project_manager, agronomist */}
            <Route path="compost" element={
              <ProtectedRoute allowedRoles={['project_manager', 'agronomist']}>
                <CompostPage />
              </ProtectedRoute>
            } />

            {/* Training - project_manager, field_facilitator */}
            <Route path="training" element={
              <ProtectedRoute allowedRoles={['project_manager', 'field_facilitator']}>
                <TrainingPage />
              </ProtectedRoute>
            } />

            {/* VSLA - project_manager, field_facilitator */}
            <Route path="vsla" element={
              <ProtectedRoute allowedRoles={['project_manager', 'field_facilitator']}>
                <VSLA />
              </ProtectedRoute>
            } />

            {/* Inputs & Sales - project_manager, agronomist */}
            <Route path="inputs-sales" element={
              <ProtectedRoute allowedRoles={['project_manager', 'agronomist']}>
                <InputsSalesPage />
              </ProtectedRoute>
            } />

            {/* Warehouse - project_manager, agronomist */}
            <Route path="warehouse" element={
              <ProtectedRoute allowedRoles={['project_manager', 'agronomist']}>
                <WarehouseView />
              </ProtectedRoute>
            } />

            {/* Maps - project_manager, agronomist */}
            <Route path="maps" element={
              <ProtectedRoute allowedRoles={['project_manager', 'agronomist']}>
                <MapsPage />
              </ProtectedRoute>
            } />

            {/* Users Management - project_manager ONLY */}
            <Route path="users" element={
              <ProtectedRoute allowedRoles={['project_manager']}>
                <UsersPage />
              </ProtectedRoute>
            } />

            {/* Orders - all roles (buyers see filtered view) */}
            <Route path="orders" element={
              <ProtectedRoute allowedRoles={['project_manager', 'agronomist', 'field_facilitator']}>
                <OrdersPage />
              </ProtectedRoute>
            } />

            {/* Profile - all roles */}
            <Route path="profile" element={<ProfilePage />} />

            {/* Settings - all roles */}
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
