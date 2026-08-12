import React, { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AdminRoute } from './components/AdminRoute';
import { LoadingScreen } from './components/LoadingScreen';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { LocaleProvider } from './contexts/LocaleContext';
import { AdminCandidateDetailPage } from './pages/admin/AdminCandidateDetailPage';
import { AdminCandidatesPage } from './pages/admin/AdminCandidatesPage';
import { Application } from './pages/Application';
import { Home } from './pages/Home';
import { MyDossier } from './pages/MyDossier';
import { NewApplication } from './pages/NewApplication';
import { Services } from './pages/Services';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';

export function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.style.overflow = loading ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [loading]);

  return (
    <BrowserRouter>
      <LocaleProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/sign-in" element={<Navigate to="/signin" replace />} />
            <Route path="/sign-up" element={<Navigate to="/signup" replace />} />
            <Route
              path="/services"
              element={
              <ProtectedRoute>
                  <Services />
                </ProtectedRoute>
              } />

            <Route
              path="/apply/new"
              element={
              <ProtectedRoute>
                  <NewApplication />
                </ProtectedRoute>
              } />

            <Route
              path="/apply/:serviceId"
              element={
              <ProtectedRoute>
                  <Application />
                </ProtectedRoute>
              } />

            <Route
              path="/mon-dossier"
              element={
              <ProtectedRoute>
                  <MyDossier />
                </ProtectedRoute>
              } />

            <Route
              path="/admin"
              element={
              <AdminRoute>
                  <AdminCandidatesPage />
                </AdminRoute>
              } />

            <Route
              path="/admin/:id"
              element={
              <AdminRoute>
                  <AdminCandidateDetailPage />
                </AdminRoute>
              } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </LocaleProvider>
      <AnimatePresence>
        {loading && <LoadingScreen onFinish={() => setLoading(false)} />}
      </AnimatePresence>
    </BrowserRouter>);

}