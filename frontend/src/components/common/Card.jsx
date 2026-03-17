import { motion } from 'framer-motion';

export default function Card({
  children,
  className = '',
  onClick,
  hoverable = false,
  style: customStyle,
  padding = 24,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hoverable ? {
        y: -2,
        boxShadow: 'var(--shadow-md)',
        borderColor: 'var(--border-medium)',
      } : {}}
      onClick={onClick}
      className={className}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        padding,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
        ...customStyle,
      }}
    >
      {children}
    </motion.div>
  );
}
