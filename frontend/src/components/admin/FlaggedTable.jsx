import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, ChevronLeft, ChevronRight, Inbox, Check, X } from 'lucide-react';
import StatusBadge from '../dashboard/StatusBadge';

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(n ?? 0));
}

const typeConfig = {
  DEPOSIT:    { icon: ArrowDownLeft,  color: 'var(--success)', label: 'Deposit' },
  WITHDRAWAL: { icon: ArrowUpRight,   color: 'var(--danger)',  label: 'Withdraw' },
  TRANSFER:   { icon: ArrowLeftRight, color: 'var(--info)',    label: 'Transfer' },
};

function RiskBar({ score }) {
  if (score == null) return <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>—</span>;

  let color, width, pulse;
  if (score <= 20) {
    color = '#22c55e'; width = '25%'; pulse = false;
  } else if (score <= 50) {
    color = '#f59e0b'; width = '50%'; pulse = false;
  } else if (score <= 75) {
    color = '#f97316'; width = '75%'; pulse = false;
  } else {
    color = '#ef4444'; width = '100%'; pulse = true;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 80 }}>
      <div style={{
        flex: 1, height: 6, borderRadius: 999,
        background: 'var(--border-light)', overflow: 'hidden',
      }}>
        <div style={{
          width, height: '100%', borderRadius: 999,
          background: color,
          animation: pulse ? 'risk-pulse 1.5s ease-in-out infinite' : 'none',
          transition: 'width 0.4s ease',
        }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, fontFamily: 'var(--font-mono)', minWidth: 22, textAlign: 'right' }}>
        {score}
      </span>
    </div>
  );
}

function ConfirmDialog({ action, onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      }}
      onClick={onCancel}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 8 }} animate={{ y: 0 }}
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-xl)',
          padding: 28,
          maxWidth: 380,
          width: '90%',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: 8 }}>
          Confirm {action.type === 'APPROVE' ? 'Approval' : 'Rejection'}
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
          Are you sure you want to {action.type === 'APPROVE' ? 'approve' : 'reject'} this transaction?
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '9px 18px', borderRadius: 'var(--radius-md)',
              background: 'var(--bg-secondary)', border: '1px solid var(--border-light)',
              color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'var(--font-body)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '9px 18px', borderRadius: 'var(--radius-md)',
              background: action.type === 'APPROVE'
                ? 'linear-gradient(135deg, var(--success), #25795E)'
                : 'linear-gradient(135deg, var(--danger), #b8303d)',
              border: 'none',
              color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'var(--font-body)',
            }}
          >
            {action.type === 'APPROVE' ? 'Approve' : 'Reject'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {[50, 120, 70, 80, 100, 100, 90, 80, 120].map((w, i) => (
        <td key={i} style={{ padding: '14px 12px' }}>
          <div style={{
            height: 12, width: w, borderRadius: 4,
            background: 'var(--border-light)',
            animation: 'shimmer 1.4s ease-in-out infinite',
          }} />
        </td>
      ))}
    </tr>
  );
}

export default function FlaggedTable({
  transactions = [],
  loading = false,
  page = 0,
  totalPages = 1,
  onPageChange,
  onReview,
}) {
  const [confirm, setConfirm] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  const handleAction = (txnId, decision) => {
    setConfirm({ txnId, type: decision });
  };

  const executeReview = async () => {
    if (!confirm) return;
    setLoadingId(confirm.txnId);
    setConfirm(null);
    await onReview?.(confirm.txnId, confirm.type);
    setLoadingId(null);
  };

  return (
    <div>
      <style>{`
        @keyframes shimmer { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes risk-pulse { 0%,100%{opacity:0.7} 50%{opacity:1} }
        .flagged-row:hover td { background: var(--bg-tertiary) !important; }
      `}</style>

      <AnimatePresence>
        {confirm && (
          <ConfirmDialog
            action={confirm}
            onConfirm={executeReview}
            onCancel={() => setConfirm(null)}
          />
        )}
      </AnimatePresence>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
              {['ID', 'Date', 'Type', 'Amount', 'From', 'To', 'Risk', 'Status', 'Actions'].map((h) => (
                <th key={h} style={{
                  padding: '10px 12px', textAlign: 'left',
                  fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
                  textTransform: 'uppercase', color: 'var(--text-muted)', whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: '48px 0', textAlign: 'center' }}>
                  <Inbox size={28} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} />
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'var(--font-body)' }}>
                    No flagged transactions
                  </p>
                </td>
              </tr>
            ) : (
              <AnimatePresence>
                {transactions.map((txn, i) => {
                  const cfg = typeConfig[txn.type] || typeConfig.TRANSFER;
                  const Icon = cfg.icon;
                  const isLoading = loadingId === txn.id;

                  return (
                    <motion.tr
                      key={txn.id}
                      className="flagged-row"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8, height: 0, overflow: 'hidden' }}
                      transition={{ duration: 0.25, delay: i * 0.03 }}
                      style={{ borderBottom: '1px solid var(--border-light)' }}
                    >
                      <td style={{ padding: '12px', fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        #{txn.id}
                      </td>
                      <td style={{ padding: '12px', fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {txn.createdAt
                          ? new Date(txn.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          <Icon size={13} color={cfg.color} strokeWidth={2.5} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{cfg.label}</span>
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                        {fmt(txn.amount)}
                      </td>
                      <td style={{ padding: '12px', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {txn.fromAccountId ?? '—'}
                      </td>
                      <td style={{ padding: '12px', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {txn.toAccountId ?? '—'}
                      </td>
                      <td style={{ padding: '12px', minWidth: 100 }}>
                        <RiskBar score={txn.riskScore} />
                      </td>
                      <td style={{ padding: '12px' }}>
                        <StatusBadge status={txn.status} />
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            onClick={() => handleAction(txn.id, 'APPROVE')}
                            disabled={isLoading}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 4,
                              padding: '5px 10px', borderRadius: 'var(--radius-sm)',
                              background: 'var(--success-bg)', border: '1px solid var(--success)',
                              color: 'var(--success)', fontSize: 11, fontWeight: 600,
                              cursor: isLoading ? 'not-allowed' : 'pointer',
                              fontFamily: 'var(--font-body)',
                              opacity: isLoading ? 0.5 : 1,
                              transition: 'opacity 0.15s',
                            }}
                          >
                            <Check size={11} strokeWidth={3} />
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(txn.id, 'REJECT')}
                            disabled={isLoading}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 4,
                              padding: '5px 10px', borderRadius: 'var(--radius-sm)',
                              background: 'var(--danger-bg)', border: '1px solid var(--danger)',
                              color: 'var(--danger)', fontSize: 11, fontWeight: 600,
                              cursor: isLoading ? 'not-allowed' : 'pointer',
                              fontFamily: 'var(--font-body)',
                              opacity: isLoading ? 0.5 : 1,
                              transition: 'opacity 0.15s',
                            }}
                          >
                            <X size={11} strokeWidth={3} />
                            Reject
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8,
          padding: '16px 12px 0',
        }}>
          <button
            onClick={() => onPageChange?.(page - 1)}
            disabled={page === 0}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--bg-secondary)', border: '1px solid var(--border-light)',
              cursor: page === 0 ? 'not-allowed' : 'pointer',
              color: page === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
            }}
          >
            <ChevronLeft size={15} />
          </button>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange?.(page + 1)}
            disabled={page >= totalPages - 1}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--bg-secondary)', border: '1px solid var(--border-light)',
              cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
              color: page >= totalPages - 1 ? 'var(--text-muted)' : 'var(--text-primary)',
            }}
          >
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
