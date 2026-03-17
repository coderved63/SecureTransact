import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../common/ThemeToggle';

/* ── Nav link definitions ── */
const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Architecture', href: '#architecture' },
  { label: 'Tech Stack', href: '#tech-stack' },
];

/* ── Smooth-scroll handler ── */
function scrollToSection(e, href) {
  e.preventDefault();
  const id = href.replace('#', '');
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/* ── Animation variants ── */
const navContainerVariants = {
  hidden: { opacity: 0, y: -12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const navChildVariants = {
  hidden: { opacity: 0, y: -8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const drawerVariants = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  exit: {
    x: '100%',
    transition: { duration: 0.25, ease: [0.4, 0, 1, 1] },
  },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

/* ── Styles ── */
const styles = {
  navbar: (scrolled) => ({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: 64,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: scrolled ? 'var(--surface-glass)' : 'transparent',
    backdropFilter: scrolled ? 'blur(16px)' : 'none',
    WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
    borderBottom: scrolled ? '1px solid var(--border-light)' : '1px solid transparent',
    transition: 'background 0.35s ease, backdrop-filter 0.35s ease, border-bottom 0.35s ease',
  }),
  inner: {
    width: '100%',
    maxWidth: 1200,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    textDecoration: 'none',
    cursor: 'pointer',
  },
  brandText: {
    fontFamily: 'var(--font-display)',
    fontSize: 20,
    fontWeight: 700,
    fontStyle: 'italic',
    color: 'var(--text-primary)',
    letterSpacing: '-0.01em',
    lineHeight: 1,
  },
  centerNav: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  navLink: {
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    fontWeight: 500,
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'color 0.2s ease, background 0.2s ease',
    border: 'none',
    background: 'transparent',
    lineHeight: 1,
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  loginLink: {
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    fontWeight: 500,
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: 'var(--radius-md)',
    transition: 'color 0.2s ease',
    lineHeight: 1,
  },
  getStarted: {
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    fontWeight: 600,
    color: '#ffffff',
    textDecoration: 'none',
    padding: '10px 24px',
    borderRadius: 'var(--radius-full)',
    background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
    boxShadow: 'var(--shadow-accent)',
    transition: 'box-shadow 0.2s ease, transform 0.15s ease',
    lineHeight: 1,
    display: 'inline-flex',
    alignItems: 'center',
  },
  hamburger: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-light)',
    background: 'var(--bg-secondary)',
    cursor: 'pointer',
    color: 'var(--text-primary)',
    padding: 0,
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 101,
  },
  drawer: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width: 300,
    maxWidth: '85vw',
    background: 'var(--bg-primary)',
    borderLeft: '1px solid var(--border-light)',
    zIndex: 102,
    display: 'flex',
    flexDirection: 'column',
    padding: '0 24px',
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
    borderBottom: '1px solid var(--border-light)',
  },
  drawerNav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: '20px 0',
  },
  drawerLink: {
    fontFamily: 'var(--font-body)',
    fontSize: 16,
    fontWeight: 500,
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    padding: '14px 12px',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'color 0.2s ease, background 0.2s ease',
    border: 'none',
    background: 'transparent',
    textAlign: 'left',
    display: 'block',
    width: '100%',
  },
  drawerFooter: {
    marginTop: 'auto',
    paddingBottom: 32,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  drawerLogin: {
    fontFamily: 'var(--font-body)',
    fontSize: 15,
    fontWeight: 500,
    color: 'var(--text-primary)',
    textDecoration: 'none',
    padding: '14px 0',
    textAlign: 'center',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-medium)',
    transition: 'border-color 0.2s ease',
    display: 'block',
  },
  drawerGetStarted: {
    fontFamily: 'var(--font-body)',
    fontSize: 15,
    fontWeight: 600,
    color: '#ffffff',
    textDecoration: 'none',
    padding: '14px 0',
    textAlign: 'center',
    borderRadius: 'var(--radius-full)',
    background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
    boxShadow: 'var(--shadow-accent)',
    display: 'block',
  },
};

/* ── Responsive helpers ── */
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < breakpoint);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  /* ── Scroll listener ── */
  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 50);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ── Close drawer on route/resize ── */
  useEffect(() => {
    if (!isMobile && drawerOpen) setDrawerOpen(false);
  }, [isMobile, drawerOpen]);

  /* ── Lock body scroll when drawer is open ── */
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const handleNavClick = useCallback((e, href) => {
    scrollToSection(e, href);
    setDrawerOpen(false);
  }, []);

  return (
    <>
      <motion.nav
        variants={navContainerVariants}
        initial="hidden"
        animate="visible"
        style={styles.navbar(scrolled)}
      >
        <div style={styles.inner}>
          {/* ── Left: Brand ── */}
          <motion.div variants={navChildVariants}>
            <a
              href="#hero"
              onClick={(e) => scrollToSection(e, '#hero')}
              style={styles.brand}
            >
              <Shield
                size={24}
                style={{ color: 'var(--accent)', strokeWidth: 2.2 }}
              />
              <span style={styles.brandText}>SecureTransact</span>
            </a>
          </motion.div>

          {/* ── Center: Nav links (desktop only) ── */}
          {!isMobile && (
            <motion.div variants={navChildVariants} style={styles.centerNav}>
              {NAV_LINKS.map((link) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  style={styles.navLink}
                  whileHover={{
                    color: 'var(--text-primary)',
                    background: 'var(--accent-light)',
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  {link.label}
                </motion.a>
              ))}
            </motion.div>
          )}

          {/* ── Right: Actions ── */}
          <motion.div variants={navChildVariants} style={styles.rightSection}>
            <ThemeToggle size={16} />

            {!isMobile && (
              <>
                <Link
                  to="/login"
                  style={styles.loginLink}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  style={styles.getStarted}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 6px 28px rgba(232, 117, 42, 0.4)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--shadow-accent)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Get Started
                </Link>
              </>
            )}

            {/* ── Hamburger (mobile only) ── */}
            {isMobile && (
              <button
                onClick={() => setDrawerOpen(true)}
                style={styles.hamburger}
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
            )}
          </motion.div>
        </div>
      </motion.nav>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Overlay */}
            <motion.div
              key="drawer-overlay"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setDrawerOpen(false)}
              style={styles.overlay}
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer-panel"
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={styles.drawer}
            >
              {/* Drawer header */}
              <div style={styles.drawerHeader}>
                <a
                  href="#hero"
                  onClick={(e) => handleNavClick(e, '#hero')}
                  style={styles.brand}
                >
                  <Shield
                    size={22}
                    style={{ color: 'var(--accent)', strokeWidth: 2.2 }}
                  />
                  <span style={{ ...styles.brandText, fontSize: 18 }}>
                    SecureTransact
                  </span>
                </a>
                <button
                  onClick={() => setDrawerOpen(false)}
                  style={{
                    ...styles.hamburger,
                    border: 'none',
                    background: 'transparent',
                  }}
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer nav links */}
              <div style={styles.drawerNav}>
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    style={styles.drawerLink}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--text-primary)';
                      e.currentTarget.style.background = 'var(--accent-light)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-secondary)';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              {/* Drawer footer actions */}
              <div style={styles.drawerFooter}>
                <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 8 }}>
                  <ThemeToggle size={16} />
                </div>
                <Link
                  to="/login"
                  onClick={() => setDrawerOpen(false)}
                  style={styles.drawerLogin}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-medium)';
                  }}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setDrawerOpen(false)}
                  style={styles.drawerGetStarted}
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
