import * as React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import LoginView from './modules/auth/LoginView';
import RegisterView from './modules/auth/RegisterView';
import ProductsView from './modules/products/ProductsView';
import UsersView from './modules/users/UsersView';
import ProductEntryView from './modules/product-entry/ProductEntryView';
import { InventoryExitView } from './modules/inventory-exit/InventoryExitView';
import { CustodyExitProvider } from './modules/inventory-exit/context/CustodyExitContext';
import ReportsView from './modules/reports/ReportsView';
import EntryHistoryView from './modules/entry-history/EntryHistoryView';
import MovementsView from './modules/movement-history/MovementsView';
import ForgotPasswordView from './modules/auth/ForgotPasswordView';
import ResetPasswordView from './modules/auth/ResetPasswordView';
import ControlGeneralView from './modules/inventory/ControlGeneralView';
import ChangePasswordView from './modules/auth/ChangePasswordView';
import ProfileView from './modules/profile/ProfileView';

// Ocultar splash screen cuando React cargue
document.body.classList.add('react-loaded');

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);
root.render(
  <HashRouter>
    <ThemeProvider>
      <AuthProvider>
        <CustodyExitProvider>
          <Routes>
            {/* Rutas de autenticación sin Layout */}
            <Route path="/" element={<LoginView />} />
            <Route path="/forgot-password" element={<ForgotPasswordView />} />
            <Route path="/reset-password" element={<ResetPasswordView />} />

            {/* Rutas protegidas con Layout */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/products" element={<ProductsView />} />
              <Route path="/product-entry" element={<ProductEntryView />} />
              <Route path="/inventory-exit" element={<InventoryExitView />} />
              <Route path="/entry-history" element={<EntryHistoryView />} />
              <Route path="/movement-history" element={<MovementsView />} />
              <Route path="/users" element={<UsersView />} />
              <Route path="/users/register" element={<RegisterView />} />
              <Route path="/control-general" element={<ControlGeneralView />} />
              <Route path="/reports" element={<ReportsView />} />
              <Route path="/change-password" element={<ChangePasswordView />} />
              <Route path="/profile" element={<ProfileView />} />
              {/* Fallback para rutas no existentes */}
              <Route path="*" element={<Navigate to="/control-general" replace />} />
            </Route>
          </Routes>
        </CustodyExitProvider>
      </AuthProvider>
    </ThemeProvider>
  </HashRouter>
);