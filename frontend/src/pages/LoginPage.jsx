import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Shield, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { auth } from '../services/api';
import Input from '../components/common/Input';
import ThemeToggle from '../components/common/ThemeToggle';

/* ── Diagonal line pattern for left panel ── */
const DiagonalPattern = () => (
  <svg
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04 }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern id="diag-login" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <line x1="0" y1="40" x2="40" y2="0" stroke="white" strokeWidth="1" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#diag-login)" />
  </svg>
);

export default function LoginPage() {
  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const { login }               = useAuth();
  const { dark }                = useTheme();
  const navigate                = useNavigate();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await auth.login({ email: form.email, password: form.password });
      login(data);
      navigate(data.role === 'ADMIN' ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: 'var(--font-body)',
      background: 'var(--bg-primary)',
    }}>
      {/* ── Left decorative panel (hidden on mobile) ── */}
      <div style={{
        flex: '0 0 60%',
        position: 'relative',
        overflow: 'hidden',
        background: dark
          ? 'linear-gradient(135deg, #0d0d14 0%, #16161f 50%, #1a1225 100%)'
          : 'linear-gradient(135deg, #1a1225 0%, #0d0d14 50%, #16161f 100%)',
        display: 'flex',
        flexDirection: 'column',
        padding: '48px 56px',
      }}
        className="auth-panel"
      >
        <DiagonalPattern />

        {/* Accent orb */}
        <div style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232,117,42,0.12) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        {/* Top: back link */}
        <Link to="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 13,
          color: 'rgba(255,255,255,0.4)',
          textDecoration: 'none',
          transition: 'color 0.2s',
          position: 'relative',
          zIndex: 1,
        }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
        >
          <ArrowLeft size={14} />
          Back to home
        </Link>

        {/* Center: tagline */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
        }}>
          <div style={{
            width: 40,
            height: 2,
            background: 'var(--accent)',
            marginBottom: 28,
            borderRadius: 999,
          }} />
          <blockquote style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.92)',
            lineHeight: 1.35,
            maxWidth: 480,
            margin: 0,
          }}>
            "Every transaction tells a story. We make sure it's the right one."
          </blockquote>
          <p style={{
            marginTop: 24,
            fontSize: 13,
            color: 'rgba(255,255,255,0.35)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>
            SecureTransact — Transaction Security Platform
          </p>
        </div>

        {/* Bottom: logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          position: 'relative',
          zIndex: 1,
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-accent)',
          }}>
            <Shield size={18} color="#fff" strokeWidth={2.2} />
          </div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 18,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.7)',
          }}>
            SecureTransact
          </span>
        </div>
      </div>

      {/* ── Right: form panel ── */}
      <div style={{
        flex: '0 0 40%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '48px 56px',
        position: 'relative',
        background: 'var(--bg-primary)',
      }}
        className="auth-form-panel"
      >
        {/* Theme toggle + back (mobile) */}
        <div style={{
          position: 'absolute',
          top: 24,
          right: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <Link to="/" style={{
            display: 'none',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            color: 'var(--text-muted)',
            textDecoration: 'none',
          }} className="mobile-back">
            <ArrowLeft size={12} /> Back
          </Link>
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ maxWidth: 360, width: '100%', margin: '0 auto' }}
        >
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 30,
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: 8,
          }}>
            Welcome back
          </h1>
          <p style={{
            fontSize: 14,
            color: 'var(--text-secondary)',
            marginBottom: 36,
          }}>
            Sign in to your account
          </p>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 16px',
                  background: 'var(--danger-bg)',
                  border: '1px solid var(--danger)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 20,
                  fontSize: 13,
                  color: 'var(--danger)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                <AlertCircle size={15} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input
              label="Email address"
              type="email"
              value={form.email}
              onChange={set('email')}
              icon={Mail}
              required
            />

            {/* Password with show/hide */}
            <div style={{ position: 'relative' }}>
              <Input
                label="Password"
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                icon={Lock}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                style={{
                  position: 'absolute',
                  right: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  padding: 0,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              style={{
                marginTop: 8,
                width: '100%',
                padding: '13px',
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                fontWeight: 600,
                color: '#fff',
                background: loading
                  ? 'var(--border-medium)'
                  : 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : 'var(--shadow-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'background 0.2s, box-shadow 0.2s',
              }}
            >
              {loading ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.7s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Signing in...
                </>
              ) : 'Sign in'}
            </motion.button>
          </form>

          <p style={{
            marginTop: 24,
            fontSize: 13,
            color: 'var(--text-muted)',
            textAlign: 'center',
          }}>
            Don't have an account?{' '}
            <Link to="/register" style={{
              color: 'var(--accent)',
              fontWeight: 600,
              textDecoration: 'none',
            }}>
              Create one
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @media (max-width: 768px) {
          .auth-panel { display: none !important; }
          .auth-form-panel { flex: 1 !important; padding: 40px 28px !important; }
          .mobile-back { display: inline-flex !important; }
        }
      `}</style>
    </div>
  );
}
