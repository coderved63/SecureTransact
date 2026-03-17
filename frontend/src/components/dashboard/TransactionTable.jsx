import { motion } from 'framer-motion';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import StatusBadge from './StatusBadge';

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(n ?? 0));
}

const typeConfig = {
  DEPOSIT:    { icon: ArrowDownLeft,  color: 'var(--success)', label: 'Deposit',  sign: '+' },
  WITHDRAWAL: { icon: ArrowUpRight,   color: 'var(--danger)',  label: 'Withdraw', sign: '-' },
  TRANSFER:   { icon: ArrowLeftRight, color: 'var(--info)',    label: 'Transfer', sign: '-' },
};

const riskConfig = {
  LOW:      { color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  MEDIUM:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  HIGH:     { color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  CRITICAL: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

function RiskBadge({ level }) {
  if (!level) return null;
  const cfg = riskConfig[level] || riskConfig.LOW;
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px',
      borderRadius: 'var(--radius-full)',
      fontSize: 10, fontWeight: 700,
      letterSpacing: '0.04em',
      color: cfg.color, background: cfg.bg,
      fontFamily: 'var(--font-body)',
    }}>
      {level}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {[140, 80, 200, 90, 90, 70].map((w, i) => (
        <td key={i} style={{ padding: '14px 16px' }}>
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

function EmptyState() {
  return (
    <tr>
      <td colSpan={6} style={{ padding: '48px 0', textAlign: 'center' }}>
        <Inbox size={32} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: 14, fontFamily: 'var(--font-body)' }}>
          No transactions yet
        </p>
      </td>
    </tr>
  );
}

export default function TransactionTable({
  transactions = [],
  loading = false,
  showPagination = false,
  page = 0,
  totalPages = 1,
  onPageChange,
  userAccountIds = [],
}) {
  return (
    <div>
      <style>{`
        @keyframes shimmer {
          0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; }
        }
        .txn-row:hover td { background: var(--bg-tertiary) !important; }
      `}</style>

      {/* Desktop table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
              {['Date', 'Type', 'Description', 'Amount', 'Status', 'Risk'].map((h) => (
                <th key={h} style={{
                  padding: '10px 16px',
                  textAlign: 'left',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : transactions.length === 0 ? (
              <EmptyState />
            ) : (
              transactions.map((txn, i) => {
                const cfg = typeConfig[txn.type] || typeConfig.TRANSFER;
                const Icon = cfg.icon;
                const isIncomingTransfer = txn.type === 'TRANSFER' && userAccountIds.includes(txn.toAccountId) && !userAccountIds.includes(txn.fromAccountId);
                const isPos = txn.type === 'DEPOSIT' || isIncomingTransfer;
                return (
                  <motion.tr
                    key={txn.id}
                    className="txn-row"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.04 }}
                    style={{ borderBottom: '1px solid var(--border-light)', cursor: 'default' }}
                  >
                    <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {txn.createdAt
                        ? new Date(txn.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          width: 28, height: 28, borderRadius: 8,
                          background: `${cfg.color}18`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <Icon size={13} color={cfg.color} strokeWidth={2.5} />
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{cfg.label}</span>
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--text-secondary)', maxWidth: 200 }}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {txn.description || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{
                        fontSize: 13, fontWeight: 700,
                        color: isPos ? 'var(--success)' : 'var(--danger)',
                        fontFamily: 'var(--font-mono)',
                      }}>
                        {isPos ? '+' : '-'}{fmt(txn.amount)}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <StatusBadge status={txn.status} />
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <RiskBadge level={txn.riskScore} />
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8,
          padding: '16px 16px 0',
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
