import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      fontFamily: 'var(--font-body)',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background orb */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600, height: 600,
        borderRadius: '50%',
        background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}
      >
        {/* Logo */}
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 32px',
          boxShadow: 'var(--shadow-accent)',
        }}>
          <Shield size={26} color="#fff" strokeWidth={2.2} />
        </div>

        {/* 404 */}
        <motion.p
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(5rem, 15vw, 9rem)',
            fontWeight: 700,
            color: 'var(--border-medium)',
            lineHeight: 1,
            marginBottom: 8,
            letterSpacing: '-0.04em',
          }}
        >
          404
        </motion.p>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.4rem, 3vw, 2rem)',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: 12,
        }}>
          Page not found
        </h1>
        <p style={{
          fontSize: 15,
          color: 'var(--text-secondary)',
          maxWidth: 360,
          lineHeight: 1.6,
          marginBottom: 36,
        }}>
          This page doesn't exist or has been moved. Head back to safety.
        </p>

        <motion.div
          style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <Link
            to="/"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '11px 24px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
              color: '#fff',
              fontSize: 14, fontWeight: 600,
              textDecoration: 'none',
              boxShadow: 'var(--shadow-accent)',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
          >
            <ArrowLeft size={15} />
            Back to Home
          </Link>
          <Link
            to="/login"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '11px 24px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-secondary)',
              fontSize: 14, fontWeight: 600,
              textDecoration: 'none',
              transition: 'border-color 0.2s, color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.color = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-medium)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            Sign in
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
