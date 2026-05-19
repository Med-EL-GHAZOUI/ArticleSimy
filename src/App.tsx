import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Articles from "./pages/Articles";
import Panier from "./pages/Panier";
import Commandes from "./pages/Commandes";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import AuditLogs from "./pages/AuditLogs";
import UsersManagement from "./pages/UsersManagement";
import OrderTracking from "./pages/OrderTracking";
import NotificationsPage from "./pages/NotificationsPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute roles={['ADMIN']}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute roles={['ADMIN']}>
            <UsersManagement />
          </ProtectedRoute>
        } />
        <Route path="/audit-logs" element={
          <ProtectedRoute roles={['ADMIN']}>
            <AuditLogs />
          </ProtectedRoute>
        } />

        {/* Catalog — accessible to all authenticated users */}
        <Route path="/articles" element={
          <ProtectedRoute><Articles /></ProtectedRoute>
        } />

        {/* Client routes */}
        <Route path="/panier" element={
          <ProtectedRoute roles={['CLIENT', 'ADMIN']}>
            <Panier />
          </ProtectedRoute>
        } />
        <Route path="/wishlist" element={
          <ProtectedRoute roles={['CLIENT', 'ADMIN']}>
            <Wishlist />
          </ProtectedRoute>
        } />
        <Route path="/commandes" element={
          <ProtectedRoute><Commandes /></ProtectedRoute>
        } />
        <Route path="/commandes/:id/tracking" element={
          <ProtectedRoute><OrderTracking /></ProtectedRoute>
        } />

        {/* Profile & Notifications — all authenticated */}
        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute><NotificationsPage /></ProtectedRoute>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
