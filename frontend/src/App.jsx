import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import { useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './components/common/Toast';
import Loader from './components/common/Loader';

const LandingPage        = lazy(() => import('./pages/LandingPage'));
const LoginPage          = lazy(() => import('./pages/LoginPage'));
const RegisterPage       = lazy(() => import('./pages/RegisterPage'));
const DashboardPage      = lazy(() => import('./pages/DashboardPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const NotFoundPage       = lazy(() => import('./pages/NotFoundPage'));

/* ── page transition wrapper ─────────────────────── */
const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0,  transition: { duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.15 } },
};

function PageTransition({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ minHeight: '100vh' }}
    >
      {children}
    </motion.div>
  );
}

/* ── protected route ─────────────────────────────── */
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  const showToast = useToast();
  const navigate  = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      showToast('Please sign in to continue.', 'info');
    } else if (adminOnly && user.role !== 'ADMIN') {
      showToast('Access restricted to administrators.', 'warning');
    }
  }, [loading, user, adminOnly, showToast, navigate]);

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return children;
}

/* ── animated routes ─────────────────────────────── */
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <PageTransition><LandingPage /></PageTransition>
        } />
        <Route path="/login" element={
          <PageTransition><LoginPage /></PageTransition>
        } />
        <Route path="/register" element={
          <PageTransition><RegisterPage /></PageTransition>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <PageTransition><DashboardPage /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute adminOnly>
            <PageTransition><AdminDashboardPage /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="*" element={
          <PageTransition><NotFoundPage /></PageTransition>
        } />
      </Routes>
    </AnimatePresence>
  );
}

/* ── app root ────────────────────────────────────── */
export default function App() {
  return (
    <ToastProvider>
      <Suspense fallback={<Loader />}>
        <AnimatedRoutes />
      </Suspense>
    </ToastProvider>
  );
}
