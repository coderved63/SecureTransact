import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const QUICK_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Architecture', href: '#architecture' },
  { label: 'Tech Stack', href: '#tech-stack' },
  { label: 'Log In', to: '/login' },
  { label: 'Get Started', to: '/register' },
];

function FooterLink({ link }) {
  const [hovered, setHovered] = useState(false);

  const baseStyle = {
    fontFamily: 'var(--font-body)',
    fontSize: 13,
    color: hovered ? 'var(--accent)' : 'var(--text-secondary)',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: 0,
    lineHeight: 1.8,
    display: 'block',
  };

  const handlers = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  };

  if (link.to) {
    return (
      <Link to={link.to} style={baseStyle} {...handlers}>
        {link.label}
      </Link>
    );
  }

  return (
    <a href={link.href} style={baseStyle} {...handlers}>
      {link.label}
    </a>
  );
}

export default function Footer() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <footer
      style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-light)',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '48px 24px',
        }}
      >
        {/* Three-column grid */}
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 36 : 0,
            justifyContent: 'space-between',
          }}
        >
          {/* Left: Brand */}
          <div style={{ flex: isMobile ? 'unset' : '0 0 40%' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 12,
              }}
            >
              <Shield
                size={20}
                style={{ color: 'var(--accent)', flexShrink: 0 }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontSize: 18,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                SecureTransact
              </span>
            </div>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                color: 'var(--text-muted)',
                lineHeight: 1.6,
                margin: 0,
                maxWidth: 280,
              }}
            >
              Transaction processing &amp; fraud detection platform
            </p>
          </div>

          {/* Center: Quick Links */}
          <div style={{ flex: isMobile ? 'unset' : '0 0 30%' }}>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: 13,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-muted)',
                marginBottom: 14,
              }}
            >
              Quick Links
            </div>
            <nav>
              {QUICK_LINKS.map((link) => (
                <FooterLink key={link.label} link={link} />
              ))}
            </nav>
          </div>

          {/* Right: Built with */}
          <div style={{ flex: isMobile ? 'unset' : '0 0 25%' }}>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: 13,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-muted)',
                marginBottom: 14,
              }}
            >
              Built with
            </div>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                color: 'var(--text-muted)',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Java &middot; Spring Boot &middot; React
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid var(--border-light)',
            marginTop: 32,
            paddingTop: 24,
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              color: 'var(--text-muted)',
              margin: 0,
            }}
          >
            &copy; 2026 SecureTransact. Built for educational purposes.
          </p>
        </div>
      </div>
    </footer>
  );
}
