import { motion } from 'framer-motion';
import { PiggyBank, CreditCard, Plus, ExternalLink } from 'lucide-react';
import StatusBadge from './StatusBadge';

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n ?? 0);
}

export function AddAccountCard({ onClick }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      style={{
        minWidth: 240,
        padding: '24px 20px',
        borderRadius: 'var(--radius-xl)',
        border: '2px dashed var(--border-medium)',
        background: 'transparent',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        transition: 'border-color 0.2s',
        minHeight: 180,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-medium)'; }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        background: 'var(--bg-tertiary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.2s',
      }}>
        <Plus size={20} color="var(--text-muted)" />
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
        Add Account
      </span>
    </motion.div>
  );
}

export default function AccountCard({ account, onStatement }) {
  const isChecking = account.accountType === 'CHECKING';
  const Icon = isChecking ? CreditCard : PiggyBank;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      style={{
        minWidth: 240,
        padding: '20px',
        borderRadius: 'var(--radius-xl)',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-light)',
        borderLeft: '3px solid var(--accent)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
      }}
    >
      {/* subtle gradient wash */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 100, height: 100,
        background: 'radial-gradient(circle, rgba(232,117,42,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '3px 10px',
          background: 'var(--accent-light)',
          borderRadius: 'var(--radius-full)',
          fontSize: 11, fontWeight: 700,
          letterSpacing: '0.04em',
          color: 'var(--accent)',
          textTransform: 'uppercase',
          fontFamily: 'var(--font-body)',
        }}>
          <Icon size={10} strokeWidth={2.5} />
          {account.accountType}
        </span>
        <StatusBadge status={account.status} />
      </div>

      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: 'var(--text-muted)',
        marginBottom: 8,
        letterSpacing: '0.06em',
      }}>
        {account.accountNumber}
      </p>

      <p style={{
        fontFamily: 'var(--font-display)',
        fontSize: 26,
        fontWeight: 700,
        color: 'var(--text-primary)',
        marginBottom: 12,
        lineHeight: 1.1,
      }}>
        {fmt(account.balance)}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
          {account.createdAt ? `Since ${new Date(account.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : ''}
        </span>
        <button
          onClick={onStatement}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 11, color: 'var(--accent)', background: 'none',
            border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-body)',
            fontWeight: 600,
          }}
        >
          Statement <ExternalLink size={10} />
        </button>
      </div>
    </motion.div>
  );
}
