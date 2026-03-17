import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

/* ── context ─────────────────────────────────────── */
const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle,
  error:   XCircle,
  warning: AlertTriangle,
  info:    Info,
};

const COLORS = {
  success: { color: 'var(--success)', bg: 'var(--success-bg)', border: 'var(--success)' },
  error:   { color: 'var(--danger)',  bg: 'var(--danger-bg)',  border: 'var(--danger)'  },
  warning: { color: 'var(--warning)', bg: 'var(--warning-bg)', border: 'var(--warning)' },
  info:    { color: 'var(--info)',    bg: 'var(--info-bg)',    border: 'var(--info)'    },
};

/* ── single toast item ───────────────────────────── */
function ToastItem({ id, message, type = 'info', onDismiss }) {
  const cfg = COLORS[type] || COLORS.info;
  const Icon = ICONS[type] || Info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0,  scale: 1    }}
      exit={{    opacity: 0, x: 60, scale: 0.95, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        minWidth: 280,
        maxWidth: 380,
        padding: '12px 14px',
        borderRadius: 'var(--radius-lg)',
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        boxShadow: 'var(--shadow-md)',
        fontFamily: 'var(--font-body)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        pointerEvents: 'all',
      }}
    >
      <Icon
        size={16}
        color={cfg.color}
        strokeWidth={2.5}
        style={{ flexShrink: 0, marginTop: 1 }}
      />
      <span style={{
        flex: 1,
        fontSize: 13,
        lineHeight: 1.45,
        color: cfg.color,
        fontWeight: 500,
      }}>
        {message}
      </span>
      <button
        onClick={() => onDismiss(id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: cfg.color,
          opacity: 0.6,
          padding: 0,
          flexShrink: 0,
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; }}
      >
        <X size={14} strokeWidth={2.5} />
      </button>
    </motion.div>
  );
}

/* ── provider ────────────────────────────────────── */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counterRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++counterRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {createPortal(
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          pointerEvents: 'none',
        }}>
          <AnimatePresence mode="sync">
            {toasts.map((t) => (
              <ToastItem
                key={t.id}
                id={t.id}
                message={t.message}
                type={t.type}
                onDismiss={dismiss}
              />
            ))}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

/* ── hook ────────────────────────────────────────── */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
