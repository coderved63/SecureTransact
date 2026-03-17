import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useSpring, useTransform } from 'framer-motion';
import { Shield } from 'lucide-react';

const floatKeyframes = `
@keyframes heroBlockFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}
@keyframes heroCoinFloat {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-14px) rotate(6deg); }
}
`;

const GRID_HEIGHTS = [
  [45, 80, 60, 35],
  [70, 50, 110, 55],
  [40, 95, 65, 85],
  [60, 45, 75, 50],
];

const ACTIVE_ROW = 1;
const ACTIVE_COL = 2;

const TRUST_CHIPS = [
  { label: 'Spring Boot 3', color: '#34d399' },
  { label: 'Real-time Scoring', color: '#f97316' },
  { label: 'JWT Secured', color: '#60a5fa' },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export default function Hero() {
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef(null);

  // Parallax springs — smooth, damped mouse tracking
  const rawX = useSpring(0, { stiffness: 60, damping: 20 });
  const rawY = useSpring(0, { stiffness: 60, damping: 20 });
  const rotateY = useTransform(rawX, [-0.5, 0.5], [6, -6]);
  const rotateX = useTransform(rawY, [-0.5, 0.5], [-4, 4]);
  const translateX = useTransform(rawX, [-0.5, 0.5], [-12, 12]);
  const translateY = useTransform(rawY, [-0.5, 0.5], [-8, 8]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleMouseMove = (e) => {
    if (isMobile) return;
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    rawX.set((e.clientX - rect.left) / rect.width - 0.5);
    rawY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        backgroundImage:
          'linear-gradient(var(--border-light) 1px, transparent 1px), linear-gradient(90deg, var(--border-light) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }}
    >
      <style>{floatKeyframes}</style>

      <div
        style={{
          width: '100%',
          maxWidth: 1200,
          margin: '0 auto',
          padding: isMobile ? '120px 24px 60px' : '0 48px',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: isMobile ? 48 : 0,
        }}
      >
        {/* LEFT SIDE */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{
            flex: isMobile ? 'unset' : '0 0 55%',
            width: isMobile ? '100%' : '55%',
          }}
        >
          {/* Eyebrow */}
          <motion.div
            variants={childVariants}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 20,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--accent)',
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-body)',
              }}
            >
              Banking Simulation Platform
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={childVariants}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)',
              fontWeight: 600,
              color: 'var(--text-primary)',
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            Secure transactions, intelligent fraud detection
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={childVariants}
            style={{
              fontSize: 16,
              color: 'var(--text-secondary)',
              maxWidth: 480,
              lineHeight: 1.7,
              marginTop: 20,
              marginBottom: 0,
              fontFamily: 'var(--font-body)',
            }}
          >
            A full-stack banking platform with real-time fraud scoring,
            ACID-compliant processing, and role-based admin controls.
          </motion.p>

          {/* Buttons */}
          <motion.div
            variants={childVariants}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginTop: 36,
              flexWrap: 'wrap',
            }}
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/register"
                style={{
                  display: 'inline-block',
                  padding: '14px 32px',
                  borderRadius: 'var(--radius-full)',
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: 'var(--font-body)',
                  textDecoration: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-accent)',
                  letterSpacing: '0.02em',
                }}
              >
                Get Started
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="#architecture"
                style={{
                  display: 'inline-block',
                  padding: '14px 32px',
                  borderRadius: 'var(--radius-full)',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: 'var(--font-body)',
                  textDecoration: 'none',
                  border: '1px solid var(--border-medium)',
                  cursor: 'pointer',
                  transition: 'border-color 0.25s ease, color 0.25s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.color = 'var(--accent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-medium)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                View Architecture
              </Link>
            </motion.div>
          </motion.div>

          {/* Trust Chips */}
          <motion.div
            variants={childVariants}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              marginTop: 40,
              flexWrap: 'wrap',
            }}
          >
            {TRUST_CHIPS.map((chip) => (
              <div
                key={chip.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: chip.color,
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                {chip.label}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* RIGHT SIDE — Isometric Grid */}
        {!isMobile && (
          <div
            style={{
              flex: '0 0 45%',
              width: '45%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <motion.div
              style={{
                position: 'relative',
                width: 340,
                height: 340,
                rotateX,
                rotateY,
                x: translateX,
                y: translateY,
                transformPerspective: 1200,
              }}
            >
              {/* Isometric container */}
              <div
                style={{
                  transform: 'perspective(1200px) rotateX(55deg) rotateZ(-45deg)',
                  transformStyle: 'preserve-3d',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 10,
                  position: 'relative',
                }}
              >
                {GRID_HEIGHTS.map((row, ri) =>
                  row.map((h, ci) => {
                    const isActive = ri === ACTIVE_ROW && ci === ACTIVE_COL;
                    const delay = ((ri * 4 + ci) * 0.14) % 2;
                    return (
                      <div
                        key={`${ri}-${ci}`}
                        style={{
                          width: 68,
                          height: h,
                          background: isActive
                            ? 'linear-gradient(135deg, var(--accent), var(--accent-hover))'
                            : 'var(--bg-card)',
                          border: isActive ? 'none' : '1px solid var(--border-light)',
                          borderRadius: 'var(--radius-sm)',
                          boxShadow: isActive
                            ? 'var(--shadow-accent)'
                            : 'var(--shadow-sm)',
                          animation: `heroBlockFloat 3.5s ease-in-out ${delay}s infinite`,
                          transition: 'box-shadow 0.3s ease',
                        }}
                      />
                    );
                  })
                )}
              </div>

              {/* Floating coin */}
              <div
                style={{
                  position: 'absolute',
                  top: -20,
                  right: 20,
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 32px rgba(249,115,22,0.35)',
                  animation: 'heroCoinFloat 4s ease-in-out 0.5s infinite',
                  zIndex: 2,
                }}
              >
                <Shield size={20} color="#fff" strokeWidth={2.2} />
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}
