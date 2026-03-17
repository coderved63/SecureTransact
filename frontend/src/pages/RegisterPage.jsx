import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Shield, ArrowLeft, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { auth } from '../services/api';
import Input from '../components/common/Input';
import PasswordStrength from '../components/auth/PasswordStrength';
import ThemeToggle from '../components/common/ThemeToggle';

const DiagonalPattern = () => (
  <svg
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04 }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern id="diag-register" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <line x1="0" y1="40" x2="40" y2="0" stroke="white" strokeWidth="1" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#diag-register)" />
  </svg>
);

export default function RegisterPage() {
  const [form, setForm]       = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const { login }             = useAuth();
  const { dark }              = useTheme();
  const navigate              = useNavigate();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const data = await auth.register(form);
      login(data);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
      {/* ── Left decorative panel ── */}
      <div
        className="auth-panel"
        style={{
          flex: '0 0 60%',
          position: 'relative',
          overflow: 'hidden',
          background: dark
            ? 'linear-gradient(135deg, #0f0d16 0%, #14121e 50%, #0d1318 100%)'
            : 'linear-gradient(135deg, #0d1318 0%, #0f0d16 50%, #14121e 100%)',
          display: 'flex',
          flexDirection: 'column',
          padding: '48px 56px',
        }}
      >
        <DiagonalPattern />

        {/* Accent orb — different position from login */}
        <div style={{
          position: 'absolute',
          bottom: '25%',
          right: '20%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232,117,42,0.1) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          top: '15%',
          left: '30%',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232,117,42,0.06) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        {/* Back link */}
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
          <ArrowLeft size={14} /> Back to home
        </Link>

        {/* Center tagline */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
        }}>
          <div style={{
            width: 40, height: 2,
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
            maxWidth: 460,
            margin: 0,
          }}>
            "Join the next generation of secure banking."
          </blockquote>
          <p style={{
            marginTop: 24,
            fontSize: 13,
            color: 'rgba(255,255,255,0.35)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>
            Secure · Real-time · Intelligent
          </p>

          {/* Feature hints */}
          <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              'ACID-compliant transaction processing',
              'Real-time fraud scoring engine',
              'Role-based admin dashboard',
            ].map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'var(--accent)', flexShrink: 0,
                }} />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-body)' }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom logo */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          position: 'relative', zIndex: 1,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
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
      <div
        className="auth-form-panel"
        style={{
          flex: '0 0 40%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '48px 56px',
          position: 'relative',
          background: 'var(--bg-primary)',
          overflowY: 'auto',
        }}
      >
        <div style={{
          position: 'absolute', top: 24, right: 24,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <Link to="/" style={{
            display: 'none', alignItems: 'center', gap: 6,
            fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none',
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
            fontSize: 30, fontWeight: 600,
            color: 'var(--text-primary)', marginBottom: 8,
          }}>
            Create Account
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 32 }}>
            Get started in seconds
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
                  display: 'flex', alignItems: 'center', gap: 10,
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
                <AlertCircle size={15} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Name row */}
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <Input
                  label="First name"
                  type="text"
                  value={form.firstName}
                  onChange={set('firstName')}
                  icon={User}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <Input
                  label="Last name"
                  type="text"
                  value={form.lastName}
                  onChange={set('lastName')}
                  required
                />
              </div>
            </div>

            <Input
              label="Email address"
              type="email"
              value={form.email}
              onChange={set('email')}
              icon={Mail}
              required
            />

            {/* Password + toggle */}
            <div>
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
                    position: 'absolute', right: 14, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', display: 'flex', padding: 0,
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <PasswordStrength password={form.password} />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              style={{
                marginTop: 6,
                width: '100%',
                padding: '13px',
                fontFamily: 'var(--font-body)',
                fontSize: 14, fontWeight: 600,
                color: '#fff',
                background: loading
                  ? 'var(--border-medium)'
                  : 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : 'var(--shadow-accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'background 0.2s, box-shadow 0.2s',
              }}
            >
              {loading ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.7s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Creating account...
                </>
              ) : 'Create Account'}
            </motion.button>
          </form>

          <p style={{
            marginTop: 24, fontSize: 13,
            color: 'var(--text-muted)', textAlign: 'center',
          }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>

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
