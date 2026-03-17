import { useState } from 'react';
import { motion } from 'framer-motion';
import { PiggyBank, CreditCard, DollarSign } from 'lucide-react';
import Modal from '../common/Modal';
import { accounts as accountsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const TYPES = [
  { value: 'SAVINGS',  label: 'Savings',  icon: PiggyBank,  desc: 'Earn interest on your balance' },
  { value: 'CHECKING', label: 'Checking', icon: CreditCard, desc: 'Easy day-to-day transactions' },
];

export default function CreateAccountModal({ isOpen, onClose, onSuccess }) {
  const { token } = useAuth();
  const [selectedType, setSelectedType] = useState('SAVINGS');
  const [deposit, setDeposit] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const amt = parseFloat(deposit);
    if (isNaN(amt) || amt < 0) { setError('Enter a valid deposit amount.'); return; }
    setLoading(true);
    try {
      const acct = await accountsApi.create({ accountType: selectedType, initialDeposit: amt }, token);
      onSuccess?.(acct);
      onClose();
      setDeposit('');
      setSelectedType('SAVINGS');
    } catch (err) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Account" maxWidth={440}>
      <form onSubmit={handleSubmit}>
        {/* Type selector */}
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, fontFamily: 'var(--font-body)' }}>
          Account Type
        </p>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {TYPES.map(({ value, label, icon: Icon, desc }) => {
            const active = selectedType === value;
            return (
              <motion.button
                key={value}
                type="button"
                onClick={() => setSelectedType(value)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  flex: 1, padding: '14px 12px', borderRadius: 'var(--radius-lg)',
                  border: `2px solid ${active ? 'var(--accent)' : 'var(--border-light)'}`,
                  background: active ? 'var(--accent-light)' : 'var(--bg-secondary)',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: active ? 'var(--accent)' : 'var(--bg-tertiary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}>
                    <Icon size={15} color={active ? '#fff' : 'var(--text-muted)'} strokeWidth={2} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: active ? 'var(--accent)' : 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>
                    {label}
                  </span>
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.4 }}>
                  {desc}
                </p>
              </motion.button>
            );
          })}
        </div>

        {/* Initial deposit */}
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, fontFamily: 'var(--font-body)' }}>
          Initial Deposit
        </p>
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <span style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', pointerEvents: 'none',
          }}>
            <DollarSign size={16} />
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={deposit}
            onChange={(e) => setDeposit(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 14px 12px 38px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: 20,
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border-medium)'; e.target.style.boxShadow = 'none'; }}
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
          type="submit"
          disabled={loading}
          whileHover={!loading ? { scale: 1.02 } : {}}
          whileTap={!loading ? { scale: 0.98 } : {}}
          style={{
            width: '100%', padding: '13px',
            background: loading ? 'var(--border-medium)' : 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
            border: 'none', borderRadius: 'var(--radius-full)',
            color: '#fff', fontSize: 14, fontWeight: 600,
            fontFamily: 'var(--font-body)',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : 'var(--shadow-accent)',
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
              Creating...
            </>
          ) : 'Create Account'}
        </motion.button>
      </form>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </Modal>
  );
}
