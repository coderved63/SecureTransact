import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Monitor, Server, Shield, Lock, Database } from 'lucide-react';

const NODES = [
  {
    id: 'react',
    icon: Monitor,
    name: 'React Frontend',
    desc: 'SPA with component-driven UI',
    delay: 0,
  },
  {
    id: 'spring',
    icon: Server,
    name: 'Spring Boot API',
    desc: 'RESTful service layer',
    delay: 0.15,
    accent: true,
  },
  {
    id: 'fraud',
    icon: Shield,
    name: 'Fraud Engine',
    desc: '5-rule real-time scoring',
    delay: 0.3,
  },
  {
    id: 'jwt',
    icon: Lock,
    name: 'JWT Auth',
    desc: 'Stateless token security',
    delay: 0.3,
  },
  {
    id: 'postgres',
    icon: Database,
    name: 'PostgreSQL',
    desc: 'ACID-compliant persistence',
    delay: 0.45,
  },
];

const boxVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut', delay },
  }),
};

const lineVariants = {
  hidden: { scaleY: 0 },
  visible: (delay) => ({
    scaleY: 1,
    transition: { duration: 0.4, ease: 'easeOut', delay },
  }),
};

const lineHVariants = {
  hidden: { scaleX: 0 },
  visible: (delay) => ({
    scaleX: 1,
    transition: { duration: 0.35, ease: 'easeOut', delay },
  }),
};

function NodeBox({ node }) {
  const [hovered, setHovered] = useState(false);
  const Icon = node.icon;
  const isAccent = node.accent;

  return (
    <motion.div
      custom={node.delay}
      variants={boxVariants}
      initial="hidden"
      animate="visible"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'var(--bg-card-hover)' : 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderLeft: isAccent ? '3px solid var(--accent)' : '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 28px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        cursor: 'default',
        transition: 'background 0.25s ease, box-shadow 0.25s ease',
        boxShadow: hovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        minWidth: 0,
      }}
    >
      <Icon size={20} style={{ color: 'var(--accent)', flexShrink: 0 }} />
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            fontSize: 14,
            color: 'var(--text-primary)',
            lineHeight: 1.3,
            whiteSpace: 'nowrap',
          }}
        >
          {node.name}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 12,
            color: 'var(--text-muted)',
            lineHeight: 1.4,
            marginTop: 2,
            whiteSpace: 'nowrap',
          }}
        >
          {node.desc}
        </div>
      </div>
    </motion.div>
  );
}

function VerticalArrow({ delay, height = 40 }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: height + 8,
      }}
    >
      {/* Line */}
      <motion.div
        custom={delay}
        variants={lineVariants}
        initial="hidden"
        animate="visible"
        style={{
          width: 2,
          height,
          background: 'var(--accent)',
          transformOrigin: 'top',
        }}
      />
      {/* Triangle */}
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderTop: '8px solid var(--accent)',
        }}
      />
    </div>
  );
}

function HorizontalLine({ delay, direction }) {
  const isLeft = direction === 'left';
  return (
    <motion.div
      custom={delay}
      variants={lineHVariants}
      initial="hidden"
      animate="visible"
      style={{
        height: 2,
        flex: 1,
        background: 'var(--accent)',
        transformOrigin: isLeft ? 'right' : 'left',
      }}
    />
  );
}

function HorizontalArrowTip({ direction }) {
  const isLeft = direction === 'left';
  return (
    <div
      style={{
        width: 0,
        height: 0,
        borderTop: '5px solid transparent',
        borderBottom: '5px solid transparent',
        ...(isLeft
          ? { borderRight: '8px solid var(--accent)' }
          : { borderLeft: '8px solid var(--accent)' }),
      }}
    />
  );
}

export default function Architecture() {
  const [isMobile, setIsMobile] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const react = NODES.find((n) => n.id === 'react');
  const spring = NODES.find((n) => n.id === 'spring');
  const fraud = NODES.find((n) => n.id === 'fraud');
  const jwt = NODES.find((n) => n.id === 'jwt');
  const postgres = NODES.find((n) => n.id === 'postgres');

  return (
    <section
      id="architecture"
      style={{
        padding: '120px 24px',
        background: 'var(--bg-primary)',
      }}
    >
      <div
        ref={ref}
        style={{
          maxWidth: 1000,
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
          Architecture
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
          System Architecture
        </h2>

        {isInView && (
          <>
            {isMobile ? (
              /* ── MOBILE: Linear vertical flow ── */
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0,
                }}
              >
                <div style={{ width: '100%', maxWidth: 280 }}>
                  <NodeBox node={react} />
                </div>
                <VerticalArrow delay={0.2} />
                <div style={{ width: '100%', maxWidth: 280 }}>
                  <NodeBox node={spring} />
                </div>
                <VerticalArrow delay={0.35} />
                <div style={{ width: '100%', maxWidth: 280 }}>
                  <NodeBox node={fraud} />
                </div>
                <VerticalArrow delay={0.45} />
                <div style={{ width: '100%', maxWidth: 280 }}>
                  <NodeBox node={jwt} />
                </div>
                <VerticalArrow delay={0.55} />
                <div style={{ width: '100%', maxWidth: 280 }}>
                  <NodeBox node={postgres} />
                </div>
              </div>
            ) : (
              /* ── DESKTOP: Full architectural diagram ── */
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0,
                }}
              >
                {/* Row 1: React Frontend */}
                <NodeBox node={react} />

                {/* Arrow: React → Spring Boot */}
                <VerticalArrow delay={0.15} />

                {/* Row 2: Spring Boot (center) */}
                <NodeBox node={spring} />

                {/* Branching row: Fraud (left) ← Spring → JWT (right) */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    maxWidth: 700,
                    marginTop: 0,
                    gap: 0,
                  }}
                >
                  {/* Left branch */}
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0,
                    }}
                  >
                    <NodeBox node={fraud} />
                    <HorizontalArrowTip direction="left" />
                    <HorizontalLine delay={0.35} direction="left" />
                  </div>

                  {/* Center vertical stub coming from Spring Boot */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      width: 2,
                    }}
                  >
                    <motion.div
                      custom={0.3}
                      variants={lineVariants}
                      initial="hidden"
                      animate="visible"
                      style={{
                        width: 2,
                        height: 24,
                        background: 'var(--accent)',
                        transformOrigin: 'top',
                      }}
                    />
                  </div>

                  {/* Right branch */}
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0,
                    }}
                  >
                    <HorizontalLine delay={0.35} direction="right" />
                    <HorizontalArrowTip direction="right" />
                    <NodeBox node={jwt} />
                  </div>
                </div>

                {/* Arrow: Spring Boot → PostgreSQL */}
                <VerticalArrow delay={0.4} />

                {/* Row 3: PostgreSQL */}
                <NodeBox node={postgres} />
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
