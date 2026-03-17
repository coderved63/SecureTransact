import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const overlayVariants = {
  hidden: { opacity: 0, backdropFilter: 'blur(0px)' },
  visible: { opacity: 1, backdropFilter: 'blur(10px)', transition: { duration: 0.25 } },
  exit:   { opacity: 0, backdropFilter: 'blur(0px)',  transition: { duration: 0.18 } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 16 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 26, delay: 0.04 } },
  exit: { opacity: 0, scale: 0.96, y: 10, transition: { duration: 0.15 } },
};

const sheetVariants = {
  hidden: { opacity: 0, y: '100%' },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 30 } },
  exit: { opacity: 0, y: '100%', transition: { duration: 0.2 } },
};

export default function Modal({ isOpen, onClose, title, children, maxWidth = 460 }) {
  const cardRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 600);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: isMobile ? 'flex-end' : 'center',
            justifyContent: 'center',
            padding: isMobile ? 0 : 24,
            WebkitBackdropFilter: 'blur(10px)',
            background: 'rgba(0,0,0,0.5)',
          }}
        >
          <motion.div
            ref={cardRef}
            variants={isMobile ? sheetVariants : cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: isMobile ? '100%' : maxWidth,
              maxHeight: isMobile ? '90vh' : '85vh',
              overflowY: 'auto',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              borderRadius: isMobile ? 'var(--radius-xl) var(--radius-xl) 0 0' : 'var(--radius-xl)',
              boxShadow: 'var(--shadow-lg)',
              padding: 28,
              position: 'relative',
            }}
          >
            {/* Mobile drag handle */}
            {isMobile && (
              <div style={{
                width: 40, height: 4, borderRadius: 2,
                background: 'var(--border-medium)',
                margin: '0 auto 20px',
              }} />
            )}

            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
            }}>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 20,
                fontWeight: 600,
                color: 'var(--text-primary)',
                margin: 0,
              }}>
                {title}
              </h3>
              <button
                onClick={onClose}
                aria-label="Close modal"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'color 0.15s, background 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--danger)';
                  e.currentTarget.style.background = 'var(--danger-bg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
