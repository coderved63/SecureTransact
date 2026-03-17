import { motion } from 'framer-motion';

const criteria = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'Uppercase letter',       test: (p) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter',       test: (p) => /[a-z]/.test(p) },
  { label: 'Number',                 test: (p) => /[0-9]/.test(p) },
  { label: 'Special character',      test: (p) => /[^A-Za-z0-9]/.test(p) },
];

const strengthMeta = [
  null,
  { label: 'Weak',      color: '#ef4444' },
  { label: 'Fair',      color: '#f97316' },
  { label: 'Good',      color: '#f59e0b' },
  { label: 'Strong',    color: '#84cc16' },
  { label: 'Excellent', color: '#22c55e' },
];

export default function PasswordStrength({ password }) {
  if (!password) return null;

  const score = criteria.filter((c) => c.test(password)).length;
  const meta = strengthMeta[score] || strengthMeta[1];

  return (
    <div style={{ marginTop: 10 }}>
      {/* Segmented bar */}
      <div style={{ display: 'flex', gap: 4 }}>
        {criteria.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 999, background: 'var(--border-light)', overflow: 'hidden' }}>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: i < score ? 1 : 0 }}
              transition={{ duration: 0.3, delay: i * 0.06, ease: [0.4, 0, 0.2, 1] }}
              style={{
                height: '100%',
                borderRadius: 999,
                transformOrigin: 'left',
                background: meta.color,
              }}
            />
          </div>
        ))}
      </div>

      {/* Label + met criteria */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
        <motion.span
          key={meta.label}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            fontSize: 12,
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            color: meta.color,
          }}
        >
          {meta.label}
        </motion.span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
          {score}/5
        </span>
      </div>
    </div>
  );
}
