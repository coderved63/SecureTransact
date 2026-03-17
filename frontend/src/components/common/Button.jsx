import { motion } from 'framer-motion';

const sizes = {
  sm: { padding: '8px 18px', fontSize: 12, gap: 6, spinner: 12 },
  md: { padding: '11px 24px', fontSize: 14, gap: 8, spinner: 14 },
  lg: { padding: '14px 32px', fontSize: 15, gap: 10, spinner: 16 },
};

const variants = {
  primary: {
    base: {
      background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
      color: '#fff',
      border: 'none',
      boxShadow: 'var(--shadow-accent)',
    },
    hover: { boxShadow: '0 6px 28px rgba(232,117,42,0.4)' },
  },
  secondary: {
    base: {
      background: 'transparent',
      color: 'var(--text-primary)',
      border: '1.5px solid var(--border-medium)',
      boxShadow: 'none',
    },
    hover: { borderColor: 'var(--accent)', color: 'var(--accent)' },
  },
  ghost: {
    base: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      border: 'none',
      boxShadow: 'none',
    },
    hover: { background: 'var(--accent-light)', color: 'var(--accent)' },
  },
  danger: {
    base: {
      background: 'var(--danger)',
      color: '#fff',
      border: 'none',
      boxShadow: '0 4px 20px rgba(214,59,74,0.25)',
    },
    hover: { boxShadow: '0 6px 28px rgba(214,59,74,0.4)' },
  },
};

function Spinner({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation: 'btn-spin 0.7s linear infinite' }}>
      <style>{`@keyframes btn-spin { to { transform: rotate(360deg) } }`}</style>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  loading = false,
  fullWidth = false,
  icon: Icon,
  type = 'button',
  style: customStyle,
}) {
  const s = sizes[size] || sizes.md;
  const v = variants[variant] || variants.primary;
  const off = disabled || loading;

  const isShimmer = variant === 'primary' && !off;

  return (
    <motion.button
      type={type}
      onClick={off ? undefined : onClick}
      whileHover={off ? {} : { scale: 1.02, ...v.hover }}
      whileTap={off ? {} : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={isShimmer ? 'btn-shimmer-wrap' : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: s.gap,
        padding: s.padding,
        fontSize: s.fontSize,
        fontFamily: 'var(--font-body)',
        fontWeight: 600,
        borderRadius: 'var(--radius-full)',
        cursor: off ? 'not-allowed' : 'pointer',
        opacity: off ? 0.5 : 1,
        pointerEvents: off ? 'none' : 'auto',
        width: fullWidth ? '100%' : 'auto',
        letterSpacing: '0.01em',
        lineHeight: 1,
        transition: 'background 0.2s, box-shadow 0.2s, border-color 0.2s, color 0.2s',
        outline: 'none',
        ...v.base,
        ...customStyle,
      }}
    >
      {loading ? (
        <Spinner size={s.spinner} />
      ) : (
        <>
          {Icon && <Icon size={s.fontSize} strokeWidth={2.2} />}
          {children}
        </>
      )}
    </motion.button>
  );
}

export { Spinner };
