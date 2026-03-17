import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Inbox, Search } from 'lucide-react';
import StatusBadge from '../dashboard/StatusBadge';

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n ?? 0);
}

function SkeletonRow() {
  return (
    <tr>
      {[120, 80, 100, 80, 110].map((w, i) => (
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

export default function AllAccountsTable({
  accounts = [],
  loading = false,
  page = 0,
  totalPages = 1,
  onPageChange,
}) {
  const [search, setSearch] = useState('');

  const filtered = search
    ? accounts.filter((a) =>
        (a.accountNumber || '').toLowerCase().includes(search.toLowerCase())
      )
    : accounts;

  return (
    <div>
      <style>{`
        @keyframes shimmer { 0%,100%{opacity:0.5} 50%{opacity:1} }
        .acct-row:hover td { background: var(--bg-tertiary) !important; }
      `}</style>

      {/* Search bar */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-light)',
      }}>
        <div style={{ position: 'relative', maxWidth: 280 }}>
          <Search size={14} color="var(--text-muted)" style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            pointerEvents: 'none',
          }} />
          <input
            type="text"
            placeholder="Search by account number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 34px',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: 12,
              fontFamily: 'var(--font-body)',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border-light)'; }}
          />
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
              {['Account Number', 'Type', 'Balance', 'Status', 'Created'].map((h) => (
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
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '48px 0', textAlign: 'center' }}>
                  <Inbox size={28} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} />
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'var(--font-body)' }}>
                    {search ? 'No matching accounts' : 'No accounts found'}
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((acct, i) => (
                <motion.tr
                  key={acct.id}
                  className="acct-row"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  style={{ borderBottom: '1px solid var(--border-light)', cursor: 'default' }}
                >
                  <td style={{ padding: '12px', fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
                    {acct.accountNumber}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      display: 'inline-block', padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: 10, fontWeight: 700,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      color: 'var(--accent)',
                      background: 'var(--accent-subtle)',
                      fontFamily: 'var(--font-body)',
                    }}>
                      {acct.accountType}
                    </span>
                  </td>
                  <td style={{
                    padding: '12px', fontSize: 13, fontWeight: 700,
                    fontFamily: 'var(--font-mono)', color: 'var(--text-primary)',
                  }}>
                    {fmt(acct.balance)}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <StatusBadge status={acct.status} />
                  </td>
                  <td style={{ padding: '12px', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {acct.createdAt
                      ? new Date(acct.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : '—'}
                  </td>
                </motion.tr>
              ))
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
