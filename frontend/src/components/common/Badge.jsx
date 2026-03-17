const variantMap = {
  success: { color: 'var(--success)', bg: 'var(--success-bg)' },
  danger:  { color: 'var(--danger)',  bg: 'var(--danger-bg)' },
  warning: { color: 'var(--warning)', bg: 'var(--warning-bg)' },
  info:    { color: 'var(--info)',    bg: 'var(--info-bg)' },
  default: { color: 'var(--text-secondary)', bg: 'var(--bg-tertiary)' },
};

export default function Badge({ variant = 'default', children, style: customStyle }) {
  const v = variantMap[variant] || variantMap.default;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '4px 10px',
      fontSize: 12,
      fontFamily: 'var(--font-body)',
      fontWeight: 600,
      letterSpacing: '0.02em',
      color: v.color,
      background: v.bg,
      borderRadius: 'var(--radius-full)',
      lineHeight: 1,
      whiteSpace: 'nowrap',
      ...customStyle,
    }}>
      {children}
    </span>
  );
}
