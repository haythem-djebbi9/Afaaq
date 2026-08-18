import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AdminRoute } from '@/features/auth/AdminRoute';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { AuthProvider } from '@/features/auth/AuthContext';
import { LocaleProvider } from '@/shared/i18n/LocaleContext';
import { ChatWidget } from '@/features/chatbot/ChatWidget';
import { ColdStartBanner } from '@/shared/components/ColdStartBanner';
import { SplashScreen } from '@/shared/components/SplashScreen';
import { AdminCandidateDetailPage } from '@/features/admin/AdminCandidateDetailPage';
import { AdminCandidatesPage } from '@/features/admin/AdminCandidatesPage';
import { Application } from '@/features/applications/Application';
import { Home } from '@/features/marketing/Home';
import { MyDossier } from '@/features/applications/MyDossier';
import { NewApplication } from '@/features/applications/NewApplication';
import { Services } from '@/features/marketing/Services';
import { SignIn } from '@/features/auth/SignIn';
import { SignUp } from '@/features/auth/SignUp';

export function App() {
  const [splashDone, setSplashDone] = useState(false);

  // Lock scrolling while the splash covers the page so the home page can't be
  // scrolled underneath it.
  useEffect(() => {
    document.body.style.overflow = splashDone ? '' : 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [splashDone]);

  return (
    <BrowserRouter>
      <AnimatePresence>
        {!splashDone && <SplashScreen onFinish={() => setSplashDone(true)} />}
      </AnimatePresence>
      <LocaleProvider>
        <ColdStartBanner />
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
          <ChatWidget />
        </AuthProvider>
      </LocaleProvider>
    </BrowserRouter>);

}