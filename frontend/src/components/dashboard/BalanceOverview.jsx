import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n ?? 0);
}

function WaveDecor() {
  return (
    <svg width="160" height="64" viewBox="0 0 160 64" fill="none" style={{ opacity: 0.18 }}>
      <path d="M0 40 C20 20, 40 60, 60 40 S100 20, 120 40 S160 60, 160 40" stroke="white" strokeWidth="2" fill="none" />
      <path d="M0 52 C20 32, 40 72, 60 52 S100 32, 120 52 S160 72, 160 52" stroke="white" strokeWidth="1.2" fill="none" />
      <circle cx="60" cy="40" r="3" fill="white" />
      <circle cx="120" cy="40" r="3" fill="white" />
    </svg>
  );
}

export default function BalanceOverview({ accounts = [] }) {
  const total = accounts.reduce((sum, a) => sum + (a.balance ?? 0), 0);
  const active = accounts.filter((a) => a.status === 'ACTIVE').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        borderRadius: 'var(--radius-xl)',
        background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
        padding: '28px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-accent)',
      }}
    >
      <div style={{ position: 'absolute', top: -40, right: 60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -30, right: -20, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <TrendingUp size={14} color="rgba(255,255,255,0.7)" />
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontFamily: 'var(--font-body)', fontWeight: 500 }}>
            Total Balance
          </span>
        </div>
        <motion.p
          key={total}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 4vw, 2.6rem)',
            fontWeight: 700,
            color: '#fff',
            lineHeight: 1.1,
            marginBottom: 8,
          }}
        >
          {fmt(total)}
        </motion.p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-body)' }}>
          across {accounts.length} account{accounts.length !== 1 ? 's' : ''} · {active} active
        </p>
      </div>

      <div style={{ position: 'relative', zIndex: 1, flexShrink: 0 }}>
        <WaveDecor />
      </div>
    </motion.div>
  );
}
