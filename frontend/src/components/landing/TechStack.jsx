import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const BACKEND_PILLS = [
  'Java 17',
  'Spring Boot 3',
  'Spring Security',
  'Spring Data JPA',
  'PostgreSQL',
  'JWT Auth',
];

const FRONTEND_PILLS = [
  'React 18',
  'Vite',
  'React Router',
  'Framer Motion',
  'Lucide Icons',
  'Tailwind CSS',
];

const pillVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.95 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: 'easeOut',
      delay: i * 0.06,
    },
  }),
};

function Pill({ label, index }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.span
      custom={index}
      variants={pillVariants}
      initial="hidden"
      animate="visible"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '8px 16px',
        fontSize: 13,
        fontWeight: 500,
        fontFamily: 'var(--font-body)',
        color: hovered ? 'var(--accent)' : 'var(--text-secondary)',
        background: 'var(--bg-card)',
        border: `1px solid ${hovered ? 'var(--accent)' : 'var(--border-light)'}`,
        borderRadius: 'var(--radius-full)',
        margin: 4,
        cursor: 'default',
        transition: 'border-color 0.25s ease, color 0.25s ease',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </motion.span>
  );
}

function PillGroup({ title, pills, offsetIndex = 0 }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 600,
          fontSize: 13,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text-muted)',
          marginBottom: 16,
        }}
      >
        {title}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', margin: -4 }}>
        {pills.map((label, i) => (
          <Pill key={label} label={label} index={offsetIndex + i} />
        ))}
      </div>
    </div>
  );
}

export default function TechStack() {
  const [isMobile, setIsMobile] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <section
      id="tech-stack"
      style={{
        padding: '120px 24px',
        background: 'var(--bg-primary)',
      }}
    >
      <div
        ref={ref}
        style={{
          maxWidth: 900,
          margin: '0 auto',
        }}
      >
        {/* Eyebrow */}
        <p
          style={{
            textAlign: 'center',
            fontFamily: 'var(--font-body)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            marginBottom: 12,
          }}
        >
          Stack
        </p>

        {/* Title */}
        <h2
          style={{
            textAlign: 'center',
            fontFamily: 'var(--font-display)',
            fontSize: 36,
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: 60,
            lineHeight: 1.25,
          }}
        >
          Technology Stack
        </h2>

        {/* Two-column layout */}
        {isInView && (
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? 40 : 48,
            }}
          >
            <PillGroup title="Backend" pills={BACKEND_PILLS} offsetIndex={0} />
            <PillGroup
              title="Frontend"
              pills={FRONTEND_PILLS}
              offsetIndex={BACKEND_PILLS.length}
            />
          </div>
        )}
      </div>
    </section>
  );
}
