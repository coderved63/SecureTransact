import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, DollarSign, AlertTriangle, CheckCircle, Search } from 'lucide-react';
import Modal from '../common/Modal';
import { transactions as txnApi, accounts as accountsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const TYPES = [
  { value: 'DEPOSIT',    label: 'Deposit',  icon: ArrowDownLeft,  color: 'var(--success)' },
  { value: 'WITHDRAWAL', label: 'Withdraw', icon: ArrowUpRight,   color: 'var(--danger)'  },
  { value: 'TRANSFER',   label: 'Transfer', icon: ArrowLeftRight, color: 'var(--info)'    },
];

function AccountOption({ acct }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{acct.accountNumber}</span>
      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
        {acct.accountType} · ${Number(acct.balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </span>
    </span>
  );
}

function AccountSelect({ label, value, onChange, accounts, exclude }) {
  const opts = accounts.filter((a) => a.id !== exclude);
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, fontFamily: 'var(--font-body)' }}>
        {label}
      </label>
      <select
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%', padding: '11px 14px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-md)',
          color: value ? 'var(--text-primary)' : 'var(--text-muted)',
          fontSize: 13, fontFamily: 'var(--font-body)',
          outline: 'none', cursor: 'pointer',
          appearance: 'none',
          transition: 'border-color 0.2s',
        }}
        onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; }}
        onBlur={(e) => { e.target.style.borderColor = 'var(--border-medium)'; }}
      >
        <option value="">Select account…</option>
        {opts.map((a) => (
          <option key={a.id} value={a.id}>
            {a.accountNumber} — {a.accountType} (${Number(a.balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })})
          </option>
        ))}
      </select>
    </div>
  );
}

export default function NewTransactionModal({ isOpen, onClose, onSuccess, accounts = [], initialType = 'DEPOSIT' }) {
  const { token } = useAuth();
  const [type, setType] = useState(initialType);
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [toAccountNumber, setToAccountNumber] = useState('');
  const [toAccountPreview, setToAccountPreview] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  // Reset when modal opens/type changes
  useEffect(() => {
    if (isOpen) {
      setType(initialType); setError(''); setResult(null);
      setToAccountNumber(''); setToAccountPreview(null); setLookupError(''); setToId('');
    }
  }, [isOpen, initialType]);

  const handleLookup = async () => {
    if (!toAccountNumber.trim()) return;
    setLookupLoading(true);
    setLookupError('');
    setToAccountPreview(null);
    setToId('');
    try {
      const acct = await accountsApi.lookupByAccountNumber(toAccountNumber.trim(), token);
      setToAccountPreview(acct);
      setToId(acct.id);
    } catch {
      setLookupError('Account not found. Check the account number and try again.');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) { setError('Enter a valid positive amount.'); return; }
    if (type === 'TRANSFER' && !toId) { setError('Please verify the destination account number first.'); return; }

    const payload = { type, amount: amt, description: desc || null };
    if (type === 'DEPOSIT')    payload.toAccountId   = parseInt(toId);
    if (type === 'WITHDRAWAL') payload.fromAccountId = parseInt(fromId);
    if (type === 'TRANSFER')   { payload.fromAccountId = parseInt(fromId); payload.toAccountId = parseInt(toId); }

    setLoading(true);
    try {
      const txn = await txnApi.create(payload, token);
      setResult(txn);
    } catch (err) {
      setError(err.message || 'Transaction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    onSuccess?.(result);
    onClose();
    setAmount(''); setDesc(''); setFromId(''); setToId(''); setResult(null);
  };

  const activeType = TYPES.find((t) => t.value === type);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Transaction" maxWidth={460}>
      <AnimatePresence mode="wait">
        {result ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ textAlign: 'center', padding: '12px 0 4px' }}
          >
            {result.status === 'FLAGGED' ? (
              <AlertTriangle size={40} color="var(--warning)" style={{ margin: '0 auto 12px' }} />
            ) : (
              <CheckCircle size={40} color="var(--success)" style={{ margin: '0 auto 12px' }} />
            )}
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, fontFamily: 'var(--font-display)' }}>
              {result.status === 'FLAGGED' ? 'Transaction Flagged' : 'Transaction Complete'}
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, fontFamily: 'var(--font-body)' }}>
              {result.status === 'FLAGGED'
                ? 'This transaction has been flagged for review due to unusual activity.'
                : 'Your transaction was processed successfully.'}
            </p>
            {result.riskScore && (
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                Risk Level: <strong style={{ color: 'var(--text-primary)' }}>{result.riskScore}</strong>
              </span>
            )}
            <motion.button
              onClick={handleDone}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'block', width: '100%', marginTop: 20,
                padding: '12px', borderRadius: 'var(--radius-full)',
                background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
                border: 'none', color: '#fff', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--font-body)',
                boxShadow: 'var(--shadow-accent)',
              }}
            >
              Done
            </motion.button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
          >
            {/* Type pills */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {TYPES.map(({ value, label, icon: Icon, color }) => {
                const active = type === value;
                return (
                  <motion.button
                    key={value}
                    type="button"
                    onClick={() => { setType(value); setError(''); setFromId(''); setToId(''); }}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      flex: 1, padding: '10px 8px',
                      borderRadius: 'var(--radius-md)',
                      border: `2px solid ${active ? color : 'var(--border-light)'}`,
                      background: active ? `${color}15` : 'var(--bg-secondary)',
                      cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                      transition: 'all 0.2s',
                    }}
                  >
                    <Icon size={16} color={active ? color : 'var(--text-muted)'} strokeWidth={2.5} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: active ? color : 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                      {label}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Account fields */}
            {(type === 'WITHDRAWAL' || type === 'TRANSFER') && (
              <AccountSelect label="From Account" value={fromId} onChange={setFromId} accounts={accounts} exclude={parseInt(toId)} />
            )}
            {type === 'DEPOSIT' && (
              <AccountSelect label="To Account" value={toId} onChange={setToId} accounts={accounts} exclude={parseInt(fromId)} />
            )}
            {type === 'TRANSFER' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, fontFamily: 'var(--font-body)' }}>
                  Destination Account Number
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    placeholder="e.g. ST1A2B3C4D5E"
                    value={toAccountNumber}
                    onChange={(e) => { setToAccountNumber(e.target.value); setToAccountPreview(null); setToId(''); setLookupError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleLookup())}
                    style={{
                      flex: 1, padding: '11px 14px',
                      background: 'var(--bg-secondary)', border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
                      fontSize: 13, fontFamily: 'var(--font-mono)',
                      outline: 'none', transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border-medium)'; }}
                  />
                  <motion.button
                    type="button"
                    onClick={handleLookup}
                    disabled={lookupLoading || !toAccountNumber.trim()}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      padding: '11px 16px', borderRadius: 'var(--radius-md)',
                      background: 'var(--accent)', border: 'none', color: '#fff',
                      cursor: lookupLoading || !toAccountNumber.trim() ? 'not-allowed' : 'pointer',
                      opacity: lookupLoading || !toAccountNumber.trim() ? 0.6 : 1,
                      display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600,
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    <Search size={14} />
                    {lookupLoading ? '...' : 'Verify'}
                  </motion.button>
                </div>
                {lookupError && (
                  <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 6, fontFamily: 'var(--font-body)' }}>{lookupError}</p>
                )}
                {toAccountPreview && (
                  <div style={{
                    marginTop: 8, padding: '10px 14px',
                    background: 'var(--success-bg, #0d2b1e)', border: '1px solid var(--success)',
                    borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <CheckCircle size={14} color="var(--success)" />
                    <span style={{ fontSize: 12, color: 'var(--success)', fontFamily: 'var(--font-body)' }}>
                      {toAccountPreview.accountNumber} — {toAccountPreview.accountType}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Amount */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, fontFamily: 'var(--font-body)' }}>
                Amount
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>
                  <DollarSign size={16} />
                </span>
                <input
                  type="number" min="0.01" step="0.01" placeholder="0.00" required
                  value={amount} onChange={(e) => setAmount(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 14px 12px 38px',
                    background: 'var(--bg-secondary)', border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
                    fontSize: 22, fontFamily: 'var(--font-display)', fontWeight: 600,
                    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--border-medium)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, fontFamily: 'var(--font-body)' }}>
                Description (optional)
              </label>
              <input
                type="text" placeholder="What's this for?"
                value={desc} onChange={(e) => setDesc(e.target.value)}
                maxLength={120}
                style={{
                  width: '100%', padding: '11px 14px',
                  background: 'var(--bg-secondary)', border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
                  fontSize: 13, fontFamily: 'var(--font-body)',
                  outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
                }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--border-medium)'; }}
              />
            </div>

            {/* Error */}
            {error && (
              <p style={{ fontSize: 13, color: 'var(--danger)', marginBottom: 14, fontFamily: 'var(--font-body)' }}>
                {error}
              </p>
            )}

            {/* Submit */}
            <motion.button
              type="submit" disabled={loading}
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              style={{
                width: '100%', padding: '13px',
                background: loading ? 'var(--border-medium)' : `linear-gradient(135deg, ${activeType?.color || 'var(--accent)'}, ${activeType?.color || 'var(--accent-hover)'})`,
                border: 'none', borderRadius: 'var(--radius-full)',
                color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-body)',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'background 0.2s',
              }}
            >
              {loading ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.7s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Processing...
                </>
              ) : 'Execute Transaction'}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </Modal>
  );
}
